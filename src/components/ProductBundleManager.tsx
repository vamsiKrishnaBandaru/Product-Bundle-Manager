import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../store';
import { 
  addBundleProduct, 
  removeBundleProduct, 
  reorderBundleProducts 
} from '../store/productSlice';
import ProductItem from './ProductItem';
import ProductModal from './ProductPicker';
import '../index.css';
import { BundleProduct, Product, Variant } from '../types';

const ItemTypes = {
  PRODUCT: 'product'
};

interface DraggableProductItemProps {
  bundleProduct: BundleProduct;
  index: number;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  showRemove: boolean;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableProductItem = ({ 
  bundleProduct, 
  index, 
  onEdit, 
  onRemove, 
  showRemove, 
  moveItem 
}: DraggableProductItemProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PRODUCT,
    item: { id: bundleProduct.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.PRODUCT,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`draggable-item ${isDragging ? 'is-dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <ProductItem
        bundleProduct={bundleProduct}
        index={index + 1}
        onEdit={() => onEdit(bundleProduct.id)}
        onRemove={() => onRemove(bundleProduct.id)}
        showRemove={showRemove}
      />
    </div>
  );
};

const ProductBundleManager: React.FC = () => {
  const dispatch = useDispatch();
  const { bundleProducts } = useSelector((state: RootState) => state.products);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleAddProduct = () => {
    setIsPickerOpen(true);
    setEditingProductId(null);
  };

  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setIsPickerOpen(true);
  };

  const handleRemoveProduct = (id: string) => {
    dispatch(removeBundleProduct(id));
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const items = [...bundleProducts];
    const draggedItem = items[dragIndex];
    
    items.splice(dragIndex, 1);
    items.splice(hoverIndex, 0, draggedItem);
    
    dispatch(reorderBundleProducts(items));
  };

  const handleProductSelect = (
    selectedProducts: Product[], 
    selectedVariants: Record<number, Variant[]>
  ) => {
    setIsPickerOpen(false);
    
    const newBundleProducts = selectedProducts.map(product => ({
      id: uuidv4(),
      product,
      selectedVariants: selectedVariants[product.id] || product.variants,
      discount: { type: 'flat' as 'flat' | 'percentage', value: 0 }
    }));
    
    newBundleProducts.forEach(product => {
      dispatch(addBundleProduct(product));
    });
  };

  return (
    <div style={{
      padding: '0px',
      margin: 'auto',
      width: '60%',
      fontFamily: 'Arial, sans-serif',
      height: 'calc(100vh + -179px)',
      overflow: 'scroll',
      scrollbarWidth: 'none',
  }}>
<h3>Product List</h3>
    <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 500 }}>
        <div>Product Name</div>
        <div>Discount</div>
    </div>
    <div className="product-bundle-manager">
      <DndProvider backend={HTML5Backend}>
        <div className="bundle-products-list">
          {bundleProducts.map((bundleProduct, index) => (
            <DraggableProductItem
              key={bundleProduct.id}
              bundleProduct={bundleProduct}
              index={index}
              onEdit={() => handleEditProduct(bundleProduct.id)}
              onRemove={() => handleRemoveProduct(bundleProduct.id)}
              showRemove={bundleProducts.length > 1}
              moveItem={moveItem}
            />
          ))}
        </div>
      </DndProvider>

      <button className="add-product-btn" onClick={handleAddProduct}>
        Add Product
      </button>

      {isPickerOpen && (
        <ProductModal
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleProductSelect}
          editingProductId={editingProductId}
        />
      )}
    </div>
    </div>
  );
};

export default ProductBundleManager;