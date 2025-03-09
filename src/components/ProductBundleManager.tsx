import React, { useState, useCallback } from 'react';
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
  const [emptyRow, setEmptyRow] = useState<boolean>(false);

  const handleAddEmptyProduct = () => {
    setEmptyRow(true);
  };

  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setIsPickerOpen(true);
    setEmptyRow(false); // Hide empty row when editing
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
      width: '55%',
      fontFamily: 'Arial, sans-serif',
      height: 'calc(100vh + -179px)',
      overflow: 'scroll',
      scrollbarWidth: 'none',
    }}>
      <h4>Product List</h4>
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
            {emptyRow && (
              <div style={{
                opacity: 1,
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>☰</span>
                <span>{bundleProducts.length + 1}.</span>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  width: '215px',
                  boxShadow: '0px 2px 4px 0px #0000001A',
                }}>
                  <input
                    style={{
                      flex: 1,
                      width: '215px',
                      border: '1px solid #00000012',
                      backgroundColor: '#FFFFFF',
                      padding: '12px 50px 12px 12px',
                      outline: 0,
                      boxSizing: 'border-box',
                    }}
                    type="text"
                    readOnly
                    onClick={() => handleEditProduct('new')}
                  />
                  <div
                    onClick={() => handleEditProduct('new')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      color: '#00000033',
                      cursor: 'pointer',
                      paddingTop: '8px'
                    }}
                  >
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2300000033' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'%3E%3C/path%3E%3Cpath d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'%3E%3C/path%3E%3C/svg%3E"
                      alt="Edit"
                      style={{ width: '16px', height: '16px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </DndProvider>

        <button 
          className="add-product-btn" 
          onClick={handleAddEmptyProduct}
          style={{
            border: '1px solid #008060',
            background: 'white',
            color: '#008060',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Product
        </button>

        {isPickerOpen && (
          <ProductModal
            onClose={() => {
              setIsPickerOpen(false);
              setEditingProductId(null);
              setEmptyRow(false);
            }}
            onSelect={(products, variants) => {
              // Handle product selection
              setIsPickerOpen(false);
              setEmptyRow(false);
            }}
            editingProductId={editingProductId}
          />
        )}
      </div>
    </div>
  );
};

export default ProductBundleManager;