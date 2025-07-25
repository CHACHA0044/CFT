import API from 'api/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';

const Footprint = () => {
  useAuthRedirect(); 
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    food: { type: '', amountKg: '' },
    transport: [{mode: '', distanceKm: ''}],
    electricity: [{source: '', consumptionKwh: ''}],
    waste: [{ plasticKg: '', paperKg: '', foodWasteKg: '' }]
  });

  const handleFoodChange = (e) => {
    setFormData({
      ...formData,
      food: { ...formData.food, [e.target.name]: e.target.value }
    });
  };

  const handleTransportChange = (index, e) => {
    const updated = [...formData.transport];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, transport: updated });
  };

  const addTransport = () => {
    setFormData({
      ...formData,
      transport: [...formData.transport, { mode: '', distanceKm: '' }]
    });
  };

  const handleRemoveTransport = (index) => {
  const updated = [...formData.transport];
  updated.splice(index, 1);
  setFormData({ ...formData, transport: updated });
  };

  const handleRemoveElectricity = (index) => {
  const updated = [...formData.electricity];
  updated.splice(index, 1);
  setFormData({ ...formData, electricity: updated });
};


  const handleElectricityChange = (index, e) => {
    const updated = [...formData.electricity];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setFormData({ ...formData, electricity: updated });
  };

  const addElectricity = () => {
    setFormData({
      ...formData,
      electricity: [...formData.electricity, { source: '', consumptionKwh: '' }]
    });
  };

  const handleWasteChange = (e) => {
    setFormData({
      ...formData,
      waste: [{ ...formData.waste[0], [e.target.name]: e.target.value }]
    });
  };
 // 
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [loading, setLoading] = useState(false);

const navigate = useNavigate(); 

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

 const hasEmpty = 
    !formData.food.type || 
    formData.food.amountKg === '' ||
    formData.transport.some(t => !t.mode || t.distanceKm === '') ||
    formData.electricity.some(e => !e.source || e.consumptionKwh === '') ||
    formData.waste.some(w => 
      w.plasticKg === '' || w.paperKg === '' || w.foodWasteKg === ''
    );

  const hasNegative =
    Number(formData.food.amountKg) < 0 ||
    formData.transport.some(t => Number(t.distanceKm) < 0) ||
    formData.electricity.some(e => Number(e.consumptionKwh) < 0) ||
    formData.waste.some(w => 
      Number(w.plasticKg) < 0 || Number(w.paperKg) < 0 || Number(w.foodWasteKg) < 0
    );

  if (hasEmpty) {
    setError('❓ Please fill in all required fields.');
    setLoading(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setLoading(false);
    return;
  }
  try {
    const res = await API.post('/footprint', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setSuccess('🥂');
    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 600);
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Something went wrong';
    console.error('❌ Submission Error:', err);
    setError(`❌ ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}, []);


// ui
  return (
    <motion.div
                    initial={{ x:100, opacity: 0}}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="w-full h-full"
                  >
    <PageWrapper backgroundImage="/images/edit-bk.webp">
      <div className="flex flex-col items-center justify-center w-full px-6 py-6 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl p-6 bg-white/10 dark:bg-black/30 backdrop-blur-lg rounded-xl text-white space-y-6 shadow-xl transition-all duration-500"
        >
          <h2 className="text-3xl font-bold text-center text-emerald-500 dark:text-gray-100">Carbon Footprint Entry</h2>
            <h3 className="text-1xl font-bold text-center text-emerald-500 dark:text-gray-100">Enter your estimated carbon data for this month 🌍</h3>
            {success && <p className="text-green-500 text-sm text-center animate-pulse">{success}</p>}
            {error && <p className="text-red-500 text-sm text-center animate-bounce">{error}</p>}

          {/* food */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100">Diet Type 𓌉◯𓇋</label>
            <select
              name="type"
              value={formData.food.type}
              onChange={handleFoodChange}
              className="w-full bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
              <option value="">-- Select --</option>
              <option value="Animal based">Animal based 🍖</option>
              <option value="Plant based">Plant based 🪴</option>
              <option value="Both">Mixed 🍔</option>
            </select>
            <input
              type="number"
              name="amountKg"
              placeholder="Amount (kg)"
              value={formData.food.amountKg}
              onChange={handleFoodChange}
              className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 mt-2"
            />
          </div>

          {/* transport */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100">Transport 🛸</label>
            {formData.transport.map((t, i) => (
              <div key={i} className="space-y-2 mb-2 relative">
                <select
                  name="mode"
                  value={t.mode}
                  onChange={(e) => handleTransportChange(i, e)}
                  className="w-full bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                  <option value="">-- Mode --</option>
                  <option value="Car">Car 🏎️</option>
                  <option value="Bike">Bike 🏍️</option>
                  <option value="Bus">Bus 🚐</option>
                  <option value="Metro">Metro 🚊</option>
                  <option value="Train">Train 🚂</option>
                  <option value="Flights">Flights ✈️</option>
                </select>
                <input
                  type="number"
                  name="distanceKm"
                  placeholder="Distance (km)"
                  value={t.distanceKm}
                  onChange={(e) => handleTransportChange(i, e)}
                  className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1"
                />
                 {formData.transport.length > 1 && (
      <button
        type="button"
        onClick={() => handleRemoveTransport(i)}
        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600"
      >
        Remove ❌
      </button>
    )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTransport}
              className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition"
            >
              Add Transport Source +
            </button>
          </div>

          {/* electricity */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100">Electricity ⚡</label>
            {formData.electricity.map((el, i) => (
              <div key={i} className="space-y-2 mb-2 relative">
                <select
                  name="source"
                  value={el.source}
                  onChange={(e) => handleElectricityChange(i, e)}
                  className="w-full bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md backdrop-blur-sm transition duration-300
             appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
                  <option value="">-- Source --</option>
                  <option value="Coal">Coal 🔥</option>
                  <option value="Solar">Solar ☀️</option>
                  <option value="Wind">Wind ༄</option>
                  <option value="Hydro">Hydro 🌊</option>
                  <option value="Mixed">Mixed 𓇼</option>
                </select>
                <input
                  type="number"
                  name="consumptionKwh"
                  placeholder="Consumption (kWh)"
                  value={el.consumptionKwh}
                  onChange={(e) => handleElectricityChange(i, e)}
                  className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1"
                />
                {formData.electricity.length > 1 && (
      <button
        type="button"
        onClick={() => handleRemoveElectricity(i)}
        className="absolute top-0 right-0 text-red-400 text-xs hover:text-red-600"
      >
        Remove ❌
      </button>
    )}
              </div>
            ))}
            <button
              type="button"
              onClick={addElectricity}
              className="text-emerald-500 dark:text-gray-100 hover:text-emerald-200 transition"
            >
              + Add Electricity Source
            </button>
          </div>

          {/* waste */}
          <div>
            <label className="block mb-1 text-emerald-500 dark:text-gray-100">Waste 🗑️(kg)</label>
            <input
              type="number"
              name="plasticKg"
              placeholder="Plastic"
              value={formData.waste[0].plasticKg}
              onChange={handleWasteChange}
              className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 mb-2"
            />
            <input
              type="number"
              name="paperKg"
              placeholder="Paper"
              value={formData.waste[0].paperKg}
              onChange={handleWasteChange}
              className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 mb-2"
            />
            <input
              type="number"
              name="foodWasteKg"
              placeholder="Food Waste"
              value={formData.waste[0].foodWasteKg}
              onChange={handleWasteChange}
              className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1"
            />
          </div>

          <button
  type="submit"
  disabled={loading}
  className="w-full py-2 mt-4 font-semibold text-emerald-500 dark:text-white bg-transparent border border-white rounded hover:bg-emerald-700 dark:hover:text-black hover:text-white transition duration-300 active:scale-75 flex items-center justify-center gap-2"
>
  {loading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Submitting...
    </>
  ) : success
  ? (
    'Submission Successful'
    
  ) : 'Submit'
  }
</button>
        </form>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default Footprint;
