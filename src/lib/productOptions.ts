export type ProductOptionRow = { label: string; price: string };

export function parseProductOptionRows(description: string, sectionTitle: string): ProductOptionRow[] {
  const section = description.match(new RegExp(`【${sectionTitle}】\\n?([\\s\\S]*?)(?=\\n*【|$)`))?.[1] || '';
  return section
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, ...priceParts] = line.split(/[｜|]/);
      return { label: label.trim(), price: priceParts.join('｜').trim() };
    })
    .filter(row => row.label);
}

export function serializeProductOptionRows(rows: ProductOptionRow[]) {
  return rows
    .filter(row => row.label.trim() || row.price.trim())
    .map(row => `${row.label.trim()}｜${row.price.trim()}`)
    .join('\n');
}
