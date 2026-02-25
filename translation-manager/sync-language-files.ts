import * as babelParser from '@babel/parser';
import {
  cloneNode,
  isExportNamedDeclaration,
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
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse, print, types } from 'recast';

type OtherLocales = [lang: string, Record<string, ObjectProperty>];

const parser = {
  parse(source: string) {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      tokens: true,
    });
  },
};

process(
  resolve(import.meta.dirname, '../src/osm/osmTagToNameMapping-{LANG}.ts'),
);

process(resolve(import.meta.dirname, '../src/translations/{LANG}.tsx'));

process(
  resolve(
    import.meta.dirname,
    '../src/features/supportUsModal/translations/{LANG}.tsx',
  ),
);

function findRoot(file: File) {
  const { program } = file;

  for (const statement of program.body) {
    if (isImportDeclaration(statement)) {
      statement.specifiers = statement.specifiers.filter(
        (s) =>
          !isImportSpecifier(s) ||
          (isIdentifier(s.imported) &&
            s.imported.name !== 'DeepPartial' &&
            s.imported.name !== 'DeepPartialWithRequiredObjects'),
      );

      // Remove the entire import if empty
      if (statement.specifiers.length === 0) {
        program.body.splice(program.body.indexOf(statement), 1);
      }
    }

    if (
      !isVariableDeclaration(statement) &&
      !isExportNamedDeclaration(statement)
    ) {
      continue;
    }

    let declaration;

    if (isExportNamedDeclaration(statement)) {
      if (!isVariableDeclaration(statement.declaration)) {
        continue;
      }

      declaration = statement.declaration.declarations[0];
    } else {
      declaration = statement.declarations[0];
    }

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

    if (!isObjectExpression(declaration.init)) {
      continue;
    }

    const tn =
      (typeName.name === 'DeepPartial' ||
        typeName.name === 'DeepPartialWithRequiredObjects') &&
      typeParameters?.params.length === 1 &&
      isTSTypeReference(typeParameters?.params[0]) &&
      isIdentifier(typeParameters?.params[0].typeName)
        ? typeParameters?.params[0].typeName.name
        : typeName.name;

    if (!tn.endsWith('Messages') && tn !== 'OsmTagToNameMapping') {
      continue;
    }

    typeAnnotation.typeAnnotation = {
      type: 'TSTypeReference',
      typeName: {
        type: 'Identifier',
        name: tn,
      },
    };

    return declaration.init;
  }
}

function buildTranslationMap(
  root: ObjectExpression,
  prefix: string[] = [],
  out: Record<string, ObjectProperty> = {},
): Record<string, ObjectProperty> {
  for (const prop of root.properties) {
    if (
      isObjectProperty(prop) &&
      (isIdentifier(prop.key) || isStringLiteral(prop.key))
    ) {
      const key = isIdentifier(prop.key) ? prop.key.name : prop.key.value;
      const path = [...prefix, key];

      if (isObjectExpression(prop.value)) {
        buildTranslationMap(prop.value, path, out);
      } else {
        out[path.join('.')] = prop;
      }
    }
  }

  return out;
}

function collectTranslations(
  key: string,
  otherLocales: OtherLocales[],
): string[] {
  const results: string[] = [];

  for (const [lang, map] of otherLocales) {
    const prop = map[key];

    if (!prop) {
      continue;
    }

    const rawCode = print(prop).code;

    if (/TODO translate/.test(rawCode)) {
      continue;
    }

    results.push(`${lang}: ${print(prop.value).code}`);
  }

  return results;
}

function mergeIntoLocale(
  base: ObjectExpression,
  target: ObjectExpression,
  otherLocales: OtherLocales[],
  propPath: string[] = [],
) {
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
    if (!isObjectProperty(prop)) {
      continue;
    }

    let keyName;

    if (isIdentifier(prop.key)) {
      keyName = prop.key.name;
    } else if (isStringLiteral(prop.key)) {
      keyName = prop.key.value;
    } else {
      // Skip computed or unsupported keys
      continue;
    }

    if (targetKeys.has(keyName)) {
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
        mergeIntoLocale(prop.value, targetProp.value, otherLocales, [
          ...propPath,
          keyName,
        ]);
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
        const translations = collectTranslations(
          [...propPath, keyName].join('.'),
          otherLocales,
        );

        const commentLines = [
          ' TODO translate; non-english translations:',
          ...translations,
        ];

        path.node.comments ??= [];

        path.node.comments.push({
          type: 'CommentBlock',
          value: commentLines.join('\n').replace(/\n/g, '\n * ') + '\n ',
          leading: true,
        });

        return false;
      },
    });

    target.properties.push(clonedProp);
  }
}

function parseFile(lang: string, template: string) {
  const parsed: Node = parse(
    readFileSync(template.replace('{LANG}', lang), 'utf-8'),
    { parser },
  );

  if (!isFile(parsed)) {
    throw new Error('expected File');
  }

  return parsed;
}

function process(template: string) {
  const enFile = parseFile('en', template);

  const enRoot = findRoot(enFile);

  if (!enRoot) {
    throw new Error('root not found for en');
  }

  const langs = ['cs', 'hu', 'it', 'sk', 'de', 'pl'];

  const roots = langs.map((lang) => {
    const file = parseFile(lang + '.template', template);

    const root = findRoot(file);

    if (!root) {
      throw new Error('root not found for ' + lang + ' ' + template);
    }

    return [lang, file, root] as const;
  });

  const otherLocales: OtherLocales[] = roots.map(
    ([lang, , root]) => [lang, buildTranslationMap(root)] as const,
  );

  for (const [lang, file, root] of roots) {
    mergeIntoLocale(enRoot, root, otherLocales);

    writeFileSync(
      template.replace('{LANG}', lang),

      print(file, { quote: 'single', trailingComma: true }).code,
    );
  }
}
