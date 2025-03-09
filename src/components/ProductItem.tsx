import React, { useState } from 'react';
import { BundleProduct, Variant } from '../types';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';
import { updateBundleProductVariants } from '../store/productSlice';

interface ProductItemProps {
    bundleProduct: BundleProduct;
    index: number;
    onEdit: () => void;
    onRemove: () => void;
    showRemove: boolean;
}

interface DraggableVariantItemProps {
    variant: Variant;
    index: number;
    moveVariant: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableVariantItem = ({ variant, index, moveVariant }: DraggableVariantItemProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    
    const [{ isDragging }, drag] = useDrag({
        type: 'variant',
        item: { id: variant.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    
    const [, drop] = useDrop({
        accept: 'variant',
        hover(item: { id: number; index: number }, monitor) {
            if (!ref.current) return;
            
            const dragIndex = item.index;
            const hoverIndex = index;
            
            if (dragIndex === hoverIndex) return;
            
            moveVariant(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });
    
    drag(drop(ref));
    
    return (
        <div 
            ref={ref}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab'
            }}
        >
            <span style={{ cursor: 'grab' }}>☰</span>
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
                        value={variant.title}
                        readOnly
                    />
                </div>
        </div>
    );
};

const ProductItem: React.FC<ProductItemProps> = ({
    bundleProduct,
    index,
    onEdit,
    onRemove,
    showRemove
}) => {
    const [showVariants, setShowVariants] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const dispatch = useDispatch();

    return (
        <div style={{
            opacity: 1,
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '10px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ cursor: 'grab' }}>☰</span>
                <span>{index}.</span>
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
                        value={bundleProduct.product.title}
                        readOnly
                    />
                </div>

                {!showDiscount ? (
                    <button
                        onClick={() => setShowDiscount(true)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#00B27C',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Discount
                    </button>
                ) : (
                    <>
                        <input
                            style={{
                                width: '69px',
                                border: '1px solid #00000012',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0px 2px 4px 0px #0000001A',
                                outline: 0,
                                padding: '12px',
                            }}
                            type="number"
                            name="discountValue"
                            defaultValue={0}
                        />
                        <select
                            style={{
                                width: '95px',
                                border: '1px solid #00000012',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0px 2px 4px 0px #0000001A',
                                outline: 0,
                                padding: '11px',
                            }}
                            name="discountType"
                        >
                            <option value="percentage">% Off</option>
                            <option value="flatOff">flat Off</option>
                        </select>
                    </>
                )}
                <span style={{ cursor: 'pointer' }} onClick={onRemove}>✖</span>
            </div>

            {bundleProduct.product.variants.length > 1 && (
                <div style={{ margin: '14px' }}>
                    <a
                        onClick={() => setShowVariants(!showVariants)}
                        style={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            color: '#006EFF',
                            float: 'right',
                        }}
                    >
                        <span style={{ textDecoration: 'underline' }}>
                            {showVariants ? 'Hide variants' : 'Show variants'}
                        </span>
                        {showVariants ? '▲' : '▼'}
                    </a>
                    
                    {showVariants && (
                        <div style={{ 
                            paddingLeft: '20px'
                        }}>
                            {bundleProduct.selectedVariants.map((variant, index) => (
                                <DraggableVariantItem
                                    key={variant.id}
                                    variant={variant}
                                    index={index}
                                    moveVariant={(dragIndex, hoverIndex) => {
                                        const newVariants = [...bundleProduct.selectedVariants];
                                        const [draggedVariant] = newVariants.splice(dragIndex, 1);
                                        newVariants.splice(hoverIndex, 0, draggedVariant);
                                        dispatch(updateBundleProductVariants({
                                            id: bundleProduct.id,
                                            variants: newVariants
                                        }));
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductItem;