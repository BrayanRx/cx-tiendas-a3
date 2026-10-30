import type { Categoria, Producto } from '@/lib/types'

// Catálogo simulado. Precios ficticios. Las marcas propias son ilustrativas del modelo de descuento.
export const categorias: { id: Categoria; nombre: string }[] = [
  { id: 'abarrotes', nombre: 'Abarrotes' },
  { id: 'lacteos', nombre: 'Lácteos' },
  { id: 'bebidas', nombre: 'Bebidas' },
  { id: 'frescos', nombre: 'Frescos' },
  { id: 'limpieza', nombre: 'Limpieza' },
  { id: 'cuidado-personal', nombre: 'Cuidado personal' },
]

export const productos: Producto[] = [
  { id: 'arroz-5kg', nombre: 'Arroz extra', marca: 'Don Chef', marcaPropia: true, categoria: 'abarrotes', presentacion: '5 kg', precio: 17.9, precioVolumen: 16.5, volumenMin: 6, imagen: '🍚', foto: '/productos/arroz-5kg.jpg' },
  { id: 'aceite-1l', nombre: 'Aceite vegetal', marca: 'Don Chef', marcaPropia: true, categoria: 'abarrotes', presentacion: '1 L', precio: 7.2, precioVolumen: 6.6, volumenMin: 12, imagen: '🫒' },
  { id: 'azucar-1kg', nombre: 'Azúcar rubia', marca: 'Don Chef', marcaPropia: true, categoria: 'abarrotes', presentacion: '1 kg', precio: 3.8, precioVolumen: 3.4, volumenMin: 12, imagen: '🧂', foto: '/productos/azucar-1kg.jpg' },
  { id: 'fideos-500', nombre: 'Fideos spaghetti', marca: 'Don Chef', marcaPropia: true, categoria: 'abarrotes', presentacion: '500 g', precio: 2.3, imagen: '🍝', foto: '/productos/fideos-500.jpg' },
  { id: 'atun-170', nombre: 'Filete de atún', marca: 'Mar Azul', marcaPropia: false, categoria: 'abarrotes', presentacion: '170 g', precio: 5.5, imagen: '🐟', foto: '/productos/atun-170.jpg' },
  { id: 'avena-900', nombre: 'Avena tradicional', marca: 'Don Chef', marcaPropia: true, categoria: 'abarrotes', presentacion: '900 g', precio: 6.4, imagen: '🥣', foto: '/productos/avena-900.jpg' },
  { id: 'leche-400', nombre: 'Leche evaporada', marca: 'Bianca', marcaPropia: true, categoria: 'lacteos', presentacion: '400 g', precio: 3.6, precioVolumen: 3.2, volumenMin: 24, imagen: '🥛' },
  { id: 'yogurt-1l', nombre: 'Yogurt bebible fresa', marca: 'Bianca', marcaPropia: true, categoria: 'lacteos', presentacion: '1 L', precio: 5.9, imagen: '🍓' },
  { id: 'queso-500', nombre: 'Queso fresco', marca: 'Andino', marcaPropia: false, categoria: 'lacteos', presentacion: '500 g', precio: 11.9, imagen: '🧀', foto: '/productos/queso-500.jpg' },
  { id: 'gaseosa-3l', nombre: 'Gaseosa sabor cola', marca: 'Kola Real', marcaPropia: false, categoria: 'bebidas', presentacion: '3 L', precio: 6.9, imagen: '🥤' },
  { id: 'agua-2l', nombre: 'Agua sin gas', marca: 'Cielo', marcaPropia: false, categoria: 'bebidas', presentacion: '2.5 L', precio: 2.9, imagen: '💧' },
  { id: 'huevos-15', nombre: 'Huevos pardos', marca: 'Granja', marcaPropia: false, categoria: 'frescos', presentacion: '15 unid.', precio: 9.5, imagen: '🥚', foto: '/productos/huevos-15.jpg' },
  { id: 'papa-1kg', nombre: 'Papa amarilla', marca: 'Del campo', marcaPropia: false, categoria: 'frescos', presentacion: '1 kg', precio: 4.2, imagen: '🥔', foto: '/productos/papa-1kg.jpg' },
  { id: 'pollo-1kg', nombre: 'Pollo entero', marca: 'Granja', marcaPropia: false, categoria: 'frescos', presentacion: '1 kg aprox.', precio: 9.9, imagen: '🍗', foto: '/productos/pollo-1kg.jpg' },
  { id: 'detergente-2kg', nombre: 'Detergente en polvo', marca: 'Lavalu', marcaPropia: true, categoria: 'limpieza', presentacion: '2 kg', precio: 14.5, imagen: '🧺' },
  { id: 'lejia-1l', nombre: 'Lejía tradicional', marca: 'Lavalu', marcaPropia: true, categoria: 'limpieza', presentacion: '1 L', precio: 2.7, imagen: '🧴' },
  { id: 'papel-12', nombre: 'Papel higiénico doble hoja', marca: 'Cloudy', marcaPropia: true, categoria: 'cuidado-personal', presentacion: '12 rollos', precio: 13.9, imagen: '🧻' },
  { id: 'panales-m', nombre: 'Pañales talla M', marca: 'Los Peques', marcaPropia: true, categoria: 'cuidado-personal', presentacion: '40 unid.', precio: 29.9, imagen: '👶' },
]

export const getProducto = (id: string) => productos.find((p) => p.id === id)
