'use client';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function UserWishlist() {
  const { items: wishlistItems, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useGemPouch();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    const stock = item.stock || item.inventory || 0;
    if (stock <= 0) return;
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      stock,
    });
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      const stock = item.stock || item.inventory || 0;
      if (stock > 0) {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          stock,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-1 text-gray-600">{wishlistItems.length} items saved</p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleAddAllToCart}
              className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
            >
              Add All to Cart
            </button>
            <button
              onClick={clearWishlist}
              className="rounded-lg border border-gray-300 px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="rounded-lg bg-white py-12 text-center shadow-md">
          <FontAwesomeIcon icon={faHeart} className="mb-4 text-4xl text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="mb-6 text-gray-600">
            Save items you love by clicking the heart icon on any product
          </p>
          <Link
            href="/shop"
            className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map(item => {
            const stock = item.stock || item.inventory || 0;
            const inStock = stock > 0;

            return (
              <div key={item.id} className="group overflow-hidden rounded-lg bg-white shadow-md">
                {/* Product Image */}
                <Link href={`/product/${item.id}`} className="relative block aspect-square overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                      <FontAwesomeIcon icon={faHeart} className="text-4xl text-purple-300" />
                    </div>
                  )}

                  {!inStock && (
                    <div className="absolute top-3 left-3">
                      <span className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 hover:text-purple-600">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="mb-4 text-lg font-bold text-purple-600">
                    {formatPrice(item.price)}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!inStock}
                      className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                        inStock
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'cursor-not-allowed bg-gray-300 text-gray-500'
                      }`}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4" />
                      <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wishlist Stats */}
      {wishlistItems.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Wishlist Summary</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{wishlistItems.length}</p>
              <p className="text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {wishlistItems.filter(item => (item.stock || item.inventory || 0) > 0).length}
              </p>
              <p className="text-gray-600">In Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(wishlistItems.reduce((total, item) => total + item.price, 0))}
              </p>
              <p className="text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
