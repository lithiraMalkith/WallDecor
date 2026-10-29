import type { Product } from '@/lib/products';

export function filterCatalog(products: Product[], query: string, room = 'All', style = 'All') {
  const generic = new Set(['art', 'artwork', 'artworks', 'wall', 'decor', 'design', 'designs', 'piece', 'pieces', 'sculpture', 'relief', 'reliefs']);
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(token => token && !generic.has(token));
  return products.filter(product => {
    const rooms = product.rooms || [product.room];
    const styles = product.styles || [product.style];
    const matchesRoom = room === 'All' || rooms.some(value => value.toLowerCase() === room.toLowerCase() || room.toLowerCase().includes(value.toLowerCase()));
    const matchesStyle = style === 'All' || styles.some(value => value.toLowerCase() === style.toLowerCase());
    const searchable = [product.name, product.slug, product.sku, ...rooms, ...styles, product.description, product.longDescription, product.material, product.technique, product.badge, product.sizes?.length ? 'frame framed unframed sizes' : ''].filter(Boolean).join(' ').toLowerCase();
    return matchesRoom && matchesStyle && tokens.every(token => searchable.includes(token));
  });
}
