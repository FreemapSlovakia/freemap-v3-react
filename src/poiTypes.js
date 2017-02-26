export const poiTypeGroups = [
  { id: 'nature', title: 'Príroda' },
  { id: 'shop', title: 'Obchody' }
];

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const poiTypes = [
  { title: 'Vrchol', key: 'natural', value: 'peak', group: 'nature',
    template({ name, ele }) {
      return `Vrchol${name ? `<br/>${escapeHtml(name)}` : ''}${ele ? `${name ? ' ' : '<br/>'} (${nf.format(ele)} m)` : '' }`;
    }
  },
  { title: 'Prameň', key: 'natural', value: 'spring', group: 'nature',
    template({ name }) {
      return `Prameň${name ? `<br/>${escapeHtml(name)}` : ''}`;
    }
  },
  { title: 'Potraviny', key: 'shop', value: 'convenience', group: 'shop',
    template({ name }) {
      return `Potraviny${name ? `<br/>${escapeHtml(name)}` : ''}`;
    }
  }
];

export function toHtml(tags) {
  for (let key of [ 'natural', 'shop' ]) {
    if (tags[key]) {
      const pt = poiTypes.find(pt => pt.key === key && pt.value === tags[key]);
      if (pt) {
        return pt.template(tags);
      }
    }
  }
console.log("TT", tags);
  return tags.name && escapeHtml(tags.name);
}

function escapeHtml(unsafe) {
  return unsafe
     .replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#039;');
 }
