import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProducts, addBundleProduct } from '../store/productSlice';
import { Product, Variant } from '../types';
import { Loader } from './Loader';
import { v4 as uuidv4 } from 'uuid';

interface ProductModalProps {
  onClose: () => void;
  onSelect: (selectedProducts: Product[], selectedVariants: Record<number, Variant[]>) => void;
  editingProductId: string | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  onClose,
  onSelect,
  editingProductId
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(fetchProducts({ search: searchQuery, page }));
      setLoading(false);
    };

    fetchData();
  }, [dispatch, searchQuery, page]);

  const handleClose = () => {
    onClose();
    setSelectedProducts({});
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleProductSelect = (productId: number, variants: Variant[], isChecked: boolean) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: isChecked ? variants.map(v => v.id) : [],
    }));
  };

  const handleVariantSelect = (productId: number, variantId: number, isChecked: boolean) => {
    setSelectedProducts(prev => {
      const updatedVariants = isChecked
        ? [...(prev[productId] || []), variantId]
        : (prev[productId] || []).filter(id => id !== variantId);

      return {
        ...prev,
        [productId]: updatedVariants,
      };
    });
  };

  const handleAdd = () => {
    Object.keys(selectedProducts).forEach((productId) => {
      const numericProductId = parseInt(productId);
      const selectedProduct = products.find((product) => product.id === numericProductId);
      if (selectedProduct) {
        const varientSelected = selectedProduct?.variants
          .filter((vari) => (selectedProducts[numericProductId] || []).includes(vari.id))
          .map((variant) => ({ ...variant, discountValue: 0, discountType: 'percentage' }));
        dispatch(addBundleProduct({
          id: uuidv4(),
          product: selectedProduct,
          selectedVariants: varientSelected,
          discount: { type: 'percentage', value: 0 }
        }));
      }
    });

    handleClose();
  };

  const getSelectedCount = () => {
    return Object.values(selectedProducts).filter(variants => variants.length > 0).length;
  };

  const selectedProductsCount = getSelectedCount();

  const renderList = () => (
    <div
      style={{
        overflowY: 'auto',
        height: '395px',
        scrollbarWidth: 'thin',
      }}
    >
      {(products || []).map((product) => {
        const productSelected = selectedProducts[product.id] || [];
        const isAllSelected = product.variants.some((v) => productSelected.includes(v.id));
        const productVariantsLength = product.variants;
        return (
          <div key={product.id}>
            {/* Product Header */}
            <div
              style={{
                borderBottom: '1px solid #0000001A',
                height: '50px',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '50px',
                  gap: '12px',
                  paddingLeft: '22px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) =>
                    handleProductSelect(product.id, product.variants, e.target.checked)
                  }
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#008060',
                    borderRadius: '4px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {product.image?.src ? (
                      <img
                        src={product.image.src}
                        alt={product.image.alt || product.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300000033' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E"
                        alt="Default Product"
                        style={{
                          width: '24px',
                          height: '24px'
                        }}
                      />
                    )}
                  </span>
                  <div>{product.title}</div>
                </div>
              </div>
            </div>

            <ul
              style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {product.variants.map((variant, index) => (
                <li
                  key={variant.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    ...(index != productVariantsLength.length - 1
                      ? { borderBottom: '1px solid #0000001A' }
                      : {}),
                    height: '50px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      paddingLeft: '68px',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={productSelected.includes(variant.id)}
                      onChange={(e) =>
                        handleVariantSelect(product.id, variant.id, e.target.checked)
                      }
                      style={{
                        width: '24px',
                        height: '24px',
                        accentColor: '#008060',
                        borderRadius: '4px',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '90%',
                      }}
                    >
                      <div>{variant.title}</div>
                      <div
                        style={{
                          marginLeft: '16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 30,
                            alignItems: 'center',
                          }}
                        >
                          <div>{`${variant.price} available`}</div>
                          <div>$ {variant.price}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {!loading && <div className="infinite-div"></div>}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '663px',
          maxHeight: '612px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>Select Product</h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              outline: 0,
            }}
            onClick={handleClose}
          >
            Close
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '32px',
                paddingTop: '10px',
              }}
            >
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
              }}>🔎</span> {/* Search Icon Placeholder */}
            </div>
            <input
              type="text"
              placeholder="Search product"
              value={searchQuery}
              onChange={handleSearch}
              style={{
                width: '87%',
                padding: '10px',
                paddingLeft: '38px',
                margin: '20px',
                borderRadius: '4px',
                border: '1px solid #0000001A',
                outline: 0,
              }}
            />
          </div>
          <div
            style={{
              minHeight: '395px',
              margin: 0,
              padding: 0,
              borderTop: '1px solid #0000001A',
            }}
          >
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  top: '150px',
                }}
              >
                <Loader />
              </div>
            ) : (
              renderList()
            )}
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px',
          }}
        >
          <div>{selectedProductsCount} product(s) selected</div>
          <div>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #00000066',
                borderRadius: '4px',
                marginRight: '10px',
                outline: 0,
                cursor: 'pointer',
                width: '104px',
                color: '#00000099',
              }}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              style={{
                padding: '10px 20px',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                outline: 0,
                backgroundColor: selectedProductsCount === 0 ? '#00000066' : '#008060',
                cursor: selectedProductsCount === 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={selectedProductsCount === 0}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;