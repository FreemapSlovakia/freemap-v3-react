import * as babelParser from '@babel/parser';
import {
  cloneNode,
  isFile,
  isIdentifier,
  isImportDeclaration,
  isImportSpecifier,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTSTypeAnnotation,
  isTSTypeReference,
  isVariableDeclaration,
  objectProperty,
  ObjectProperty,
  type File,
  type Node,
  type ObjectExpression,
} from '@babel/types';
import { readFileSync, writeFileSync } from 'fs';
import { parse, print, types } from 'recast';

const parser = {
  parse(source: string) {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      tokens: true,
    });
  },
};

function parseFile(lang: string) {
  const parsed: Node = parse(
    readFileSync(`../src/translations/${lang}.tsx`, 'utf-8'),
    {
      parser,
    },
  );

  if (!isFile(parsed)) {
    throw new Error('expected File');
  }

  return parsed;
}

function findRoot(file: File) {
  const { program } = file;

  for (const statement of program.body) {
    if (isImportDeclaration(statement)) {
      statement.specifiers = statement.specifiers.filter(
        (s) =>
          !isImportSpecifier(s) ||
          (isIdentifier(s.imported) && s.imported.name !== 'DeepPartial'),
      );

      // Remove the entire import if empty
      if (statement.specifiers.length === 0) {
        program.body.splice(program.body.indexOf(statement), 1);
      }
    }

    if (!isVariableDeclaration(statement)) {
      continue;
    }

    const [declaration] = statement.declarations;

    const { id } = declaration;

    if (!isIdentifier(id)) {
      continue;
    }

    const { typeAnnotation } = id;

    if (!isTSTypeAnnotation(typeAnnotation)) {
      continue;
    }

    const typeReference = typeAnnotation.typeAnnotation;

    if (
      !isTSTypeReference(typeReference) ||
      !isIdentifier(typeReference.typeName)
    ) {
      continue;
    }

    const { typeName, typeParameters } = typeReference;

    if (
      (typeName.name === 'Messages' ||
        (typeName.name === 'DeepPartial' &&
          typeParameters?.params.length === 1 &&
          isTSTypeReference(typeParameters?.params[0]) &&
          isIdentifier(typeParameters?.params[0].typeName) &&
          typeParameters?.params[0].typeName.name === 'Messages')) &&
      isObjectExpression(declaration.init)
    ) {
      typeAnnotation.typeAnnotation = {
        type: 'TSTypeReference',
        typeName: {
          type: 'Identifier',
          name: 'Messages',
        },
      };

      return declaration.init;
    }
  }
}

function mergeIntoLocale(base: ObjectExpression, target: ObjectExpression) {
  const targetKeys = new Set(
    target.properties
      .filter((p) => isObjectProperty(p))
      .map((p) =>
        isIdentifier(p.key)
          ? p.key.name
          : isStringLiteral(p.key)
            ? p.key.value
            : null,
      ),
  );

  for (const prop of base.properties) {
    if (!isObjectProperty(prop)) continue;

    const keyName = isIdentifier(prop.key)
      ? prop.key.name
      : isStringLiteral(prop.key)
        ? prop.key.value
        : null;

    if (!keyName || targetKeys.has(keyName)) {
      // key exists, recurse if both are objects
      const targetProp = target.properties.find(
        (p) =>
          isObjectProperty(p) &&
          ((isIdentifier(p.key) && p.key.name === keyName) ||
            (isStringLiteral(p.key) && p.key.value === keyName)),
      ) as ObjectProperty | undefined;

      if (
        targetProp &&
        isObjectExpression(prop.value) &&
        isObjectExpression(targetProp.value)
      ) {
        mergeIntoLocale(prop.value, targetProp.value);
      }

      continue;
    }

    // deep clone the missing prop
    const clonedProp = objectProperty(
      cloneNode(prop.key),
      cloneNode(prop.value),
    );

    types.visit(clonedProp, {
      visitNode(path) {
        const enValueCode = print(prop.value).code;

        const commentLines = [
          ' TODO translate from English:',
          ...enValueCode.split('\n').map((line) => ` ${line}`),
        ];

        path.node.comments ??= [];

        path.node.comments.push({
          type: 'CommentBlock',
          value: commentLines.join('\n *') + '\n ',
          leading: true,
        });

        return false;
      },
    });

    target.properties.push(clonedProp);
  }
}

const enFile = parseFile('en');

const huFile = parseFile('hu.template');

const enRoot = findRoot(enFile);

const huRoot = findRoot(huFile);

if (!enRoot || !huRoot) {
  throw new Error('root not found');
}

mergeIntoLocale(enRoot, huRoot);

writeFileSync(
  `../src/translations/hu.tsx`,
  print(huFile, { quote: 'single' }).code,
);
