import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';

function useDebounce(callback, delay) {
  const timer = useRef(null);

  const debouncedFunction = useCallback((value) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callback(value);
    }, delay);
  }, [callback, delay]);

  return debouncedFunction;
}

function App() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3333/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error('Errore nel recupero dei dati dal fetch:', err));
  }, []);

  useEffect(() => {
    if (query === '') {
      setSuggestions([]);
      return;
    }

    fetch(`http://localhost:3333/products?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
      })
      .catch((err) => console.error('Errore nel recupero dei dati per suggerimento:', err));
  }, [query]);

  const handleSearch = useDebounce((value) => {
    setQuery(value.toLowerCase().trim());
  }, 300);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase().trim()) ||
      product.description.toLowerCase().includes(query.toLowerCase().trim())
  );

  const selectedProductDetails = (id) => {
    fetch(`http://localhost:3333/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedProduct(data);
        setSuggestions([]); // chiudo i suggerimenti
        setQuery(data.name.toLowerCase().trim()); // aggiorno query
      })
      .catch((err) => console.error('Errore nel recupero dei dettagli del prodotto:', err));
  };

return (
  <div className="GenericContainer">
    <div className="searchContainer">
      <input
        type="text"
        placeholder="Cerca un prodotto..."
        defaultValue={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {suggestions.length > 0 && (
        <ul className="suggestionsList">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => {
                selectedProductDetails(suggestion.id);
                setSuggestions([]); // chiudo i suggerimenti
                setQuery(''); // svuoto la query per non mostrare la lista filtrata
              }}
              style={{ cursor: 'pointer' }}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Mostro la lista solo se non è selezionato un prodotto */}
    {!selectedProduct && (
      <div className="productsContainer">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div className="productCard" key={product.id}>
              <img
                src={`https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
              />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <span>{product.price} €</span>
            </div>
          ))
        ) : (
          <p>Nessun prodotto trovato.</p>
        )}
      </div>
    )}

    {/* Card dettaglio prodotto */}
    {selectedProduct && (
      <div className="selectedProductContainer">
        <h2>Dettagli Prodotto</h2>
        <div className="productCard">
          <img
            src={`https://via.placeholder.com/500x500?text=${encodeURIComponent(selectedProduct.name)}`}
            alt={selectedProduct.name}
          />
          <h2>{selectedProduct.name}</h2>
          <p>{selectedProduct.description}</p>
          <span>{selectedProduct.price} €</span>
        </div>
      </div>
    )}
  </div>
);

}

export default App;
