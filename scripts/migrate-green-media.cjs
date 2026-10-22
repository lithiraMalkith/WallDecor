// Explicit, one-time migration. Normal application reads never seed products.
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { v2: cloudinary } = require('cloudinary');
const fs = require('node:fs');
const path = require('node:path');
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n') }) });
const db = getFirestore();
const folder = 'ceylon-wall-decor/green-collection';
const scenes = [
  { id: 'living-room', file: 'gallery/living-room.webp', title: 'Room to breathe', detail: 'Living spaces', alt: 'Ivory botanical relief above a sage linen sofa in a tropical living room', wide: true, galleryOrder: 0 },
  { id: 'sage-arches', file: 'gallery/sage-arches.webp', title: 'Sage horizons', detail: 'Form & colour', alt: 'Ivory sculpted arches and a sage-green sun on an olive wall', galleryOrder: 1, carouselOrder: 1 },
  { id: 'botanical', file: 'carousel/botanical.webp', title: 'A little botanical', detail: 'Nature, in relief', alt: 'Hand-sculpted tropical leaves in an oak frame against a soft green wall', galleryOrder: 2, carouselOrder: 0 },
  { id: 'dining', file: 'gallery/dining.webp', title: 'Gather slowly', detail: 'Dining corners', alt: 'Abstract ivory plaster artwork in an olive-toned dining nook', galleryOrder: 3 },
  { id: 'coastal', file: 'carousel/coastal.webp', title: 'A quieter current', detail: 'Flowing textures', alt: 'Dimensional ivory wave relief in a natural oak frame on a seafoam wall', galleryOrder: 4, carouselOrder: 3 },
  { id: 'bedroom', file: 'gallery/bedroom.webp', title: 'Soft landings', detail: 'Restful rooms', alt: 'Cream linen and a sculpted wave relief in a sage-green bedroom', wide: true, galleryOrder: 5 },
  { id: 'contour', file: 'carousel/contour.webp', title: 'Follow the light', detail: 'Sculptural details', alt: 'Organic contour lines carved in ivory plaster with gentle daylight', galleryOrder: 6, carouselOrder: 4 },
  { id: 'craft', file: 'carousel/craft.webp', title: 'Made by hand', detail: 'The atelier', alt: 'An artisan shaping organic plaster ridges with a palette knife', carouselOrder: 2 },
];
const replacements = { sunrise: 'sage-arches', contour: 'contour', botanica: 'botanical', hero: 'coastal' };
const rewriteCopy = value => typeof value !== 'string' ? value : value
  .replace('warm ivory and Ceylon yellow', 'soft ivory and sage green')
  .replace('Graphic curves shaped by hand in plaster and charcoal pigment.', 'Organic curves shaped by hand in soft ivory plaster.')
  .replace('Large-format flowing relief with a burnished golden disc.', 'Large-format flowing relief in soft ivory and sage tones.')
  .replace('Features a burnished gold Leaf focal disc surrounded by sweeping circular textural waves.', 'Features sweeping ivory waves that catch natural light against a quiet sage backdrop.')
  .replace('Plaster, gold leaf foil, heavy texture paste', 'Mineral plaster and natural pigments')
  .replace('Architectural plaster and charcoal pigment', 'Architectural plaster and natural pigments')
  .replace('Rotational knife carving and foil leaf gilding', 'Hand-sculpted flowing plaster relief');
async function main() {
  const snapshot = await db.collection('products').get();
  console.log(JSON.stringify({ products: snapshot.docs.map(d => ({ id: d.id, slug: d.data().slug, name: d.data().name, images: d.data().images })) }, null, 2));
  if (!process.argv.includes('--apply')) {
    if (process.argv.includes('--verify')) {
      const response = await fetch('http://localhost:3000/api/products');
      const result = await response.json();
      if (!response.ok || !result.success || result.data.length !== snapshot.size) throw new Error('API catalog differs from Firestore');
      for (const doc of snapshot.docs) {
        const actual = result.data.find(product => product.id === doc.id);
        if (!actual || JSON.stringify(actual.images) !== JSON.stringify(doc.data().images)) throw new Error(`API images differ for ${doc.id}`);
      }
      const media = await db.collection('storefront_media').get();
      if (media.size !== scenes.length) throw new Error('Media migration is incomplete');
      for (const doc of media.docs) if (!doc.data().image.includes(`/${folder}/`)) throw new Error(`Media URL was not persisted: ${doc.id}`);
      console.log(JSON.stringify({ verified: true, products: snapshot.size, media: media.size, source: 'Firestore', apiImagesMatchStoredImages: true }));
    }
    return;
  }
  cloudinary.config({ cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  const media = [];
  for (const scene of scenes) {
    const uploaded = await cloudinary.uploader.upload(path.resolve('public/images', scene.file), { public_id: `${folder}/${scene.id}`, overwrite: false, resource_type: 'image' });
    const { file, ...data } = scene;
    media.push({ ...data, image: uploaded.secure_url.replace('/upload/', '/upload/e_noise:20,q_auto,f_auto/'), href: scene.id === 'craft' ? '/custom-order' : '/gallery', published: true, generated: true });
  }
  const urls = Object.fromEntries(media.map(m => [m.id, m.image]));
  const changes = [];
  const batch = db.batch();
  for (const doc of snapshot.docs) {
    const product = doc.data();
    let changed = false;
    const images = (product.images || []).map(image => {
      const match = image.match(/\/ceylon-wall-decor\/products\/(sunrise|contour|botanica|hero)\.jpg(?:\?.*)?$/);
      const local = scenes.find(scene => image === `/images/${scene.file}`);
      if (!match && !local) return image;
      changed = true;
      return urls[local ? local.id : replacements[match[1]]];
    });
    if (!changed) continue;
    const patch = { images, updatedAt: new Date().toISOString() };
    for (const key of ['shortDescription', 'longDescription', 'material', 'technique']) {
      if (product[key] !== undefined && rewriteCopy(product[key]) !== product[key]) patch[key] = rewriteCopy(product[key]);
    }
    if (Array.isArray(product.colourTags)) patch.colourTags = product.colourTags.map(tag => /^(yellow|gold|golden|ceylon yellow)$/i.test(tag) ? 'Sage Green' : tag);
    changes.push({ id: doc.id, before: Object.fromEntries(Object.keys(patch).map(k => [k, product[k]])), after: patch });
    batch.update(doc.ref, patch, { lastUpdateTime: doc.updateTime });
  }
  // Keep a recoverable record before committing any Firestore change.
  fs.mkdirSync('docs/migrations', { recursive: true });
  fs.writeFileSync(`docs/migrations/green-media-${Date.now()}.json`, JSON.stringify({ changes, media }, null, 2));
  for (const item of media) batch.set(db.collection('storefront_media').doc(item.id), item);
  await batch.commit();
  const verified = await db.collection('products').get();
  console.log(JSON.stringify({ updatedProducts: changes.length, mediaDocuments: media.length, verifiedProducts: verified.docs.map(d => ({ id: d.id, images: d.data().images })) }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
