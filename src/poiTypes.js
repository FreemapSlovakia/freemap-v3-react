export const poiTypeGroups = [
  { id: 'nature', title: 'Príroda' },
  { id: 'shop', title: 'Obchody' }
];

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const poiTypes = [
  { group: 'nature', title: 'Vrchol', key: 'natural', value: 'peak',
    template: ({ name, ele }) => `Vrchol${name ? `<br/>${escapeHtml(name)}` : ''}${ele ? `${name ? ' ' : '<br/>'} (${nf.format(ele)} m)` : '' }`
  },
  { group: 'nature', title: 'Prameň', key: 'natural', value: 'spring',
    template: ({ name }) => `Prameň${name ? `<br/>${escapeHtml(name)}` : ''}`
  },
  { group: 'shop', title: 'Potraviny', key: 'shop', value: 'convenience',
    template: ({ name }) => `Potraviny${name ? `<br/>${escapeHtml(name)}` : ''}`
  }
];

const keys = new Set(poiTypes.map(pt => pt.key));

export function toHtml(tags) {
  for (let key of keys) {
    if (tags[key]) {
      const pt = poiTypes.find(pt => pt.key === key && pt.value === tags[key]);
      if (pt) {
        return pt.template(tags);
      }
    }
  }

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
