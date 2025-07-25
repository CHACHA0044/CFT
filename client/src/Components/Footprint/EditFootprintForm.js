import API from 'api/api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from 'common/PageWrapper';
import useAuthRedirect from 'hooks/useAuthRedirect';
const EditFootprintForm = () => {
  useAuthRedirect(); 
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    food: { type: '', amountKg: '' },
    transport: [],
    electricity: [],
    waste: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await API.get(`/footprint/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
        const entry = res.data;
        setForm({
          food: entry.food || { type: '', amountKg: '' },
          transport: entry.transport || [],
          electricity: entry.electricity || [],
          waste: entry.waste || []
        });
        setLoading(false);
      } catch (err) {
        alert('Failed to load entry');
      }
    };
    fetchEntry();
  }, [id, token]);

  const handleChange = (section, field, value, index = null) => {
    if (index !== null) {
      const updated = [...form[section]];
      updated[index][field] = value;
      setForm({ ...form, [section]: updated });
    } else {
      setForm({ ...form, [section]: { ...form[section], [field]: value } });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setSaving(true);

const hasEmpty = 
    !form.food.type || 
    form.food.amountKg === '' ||
    form.transport.some(t => !t.mode || t.distanceKm === '') ||
    form.electricity.some(e => !e.source || e.consumptionKwh === '') ||
    form.waste.some(w => 
      w.plasticKg === '' || w.paperKg === '' || w.foodWasteKg === ''
    );

  const hasNegative =
    Number(form.food.amountKg) < 0 ||
    form.transport.some(t => Number(t.distanceKm) < 0) ||
    form.electricity.some(e => Number(e.consumptionKwh) < 0) ||
    form.waste.some(w => 
      Number(w.plasticKg) < 0 || Number(w.paperKg) < 0 || Number(w.foodWasteKg) < 0
    );

  if (hasEmpty) {
    setError('❓ Please fill in all required fields.');
    setSaving(false);
    return;
  }

  if (hasNegative) {
    setError('🧩 Values cannot be negative.');
    setSaving(false);
    return;
  }

  try {
    await API.put(`/footprint/${id}`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setSuccess('🥂');
    setTimeout(() => {
      navigate('/dashboard', { state: { updated: Date.now() } });
    }, 600);
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Update failed';
    setError(`❌ ${errorMsg}`);
  } finally {
    setSaving(false);
  }
};

useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}, []);

 // if (loading) return <p className="text-center text-white">Loading entry...</p>;

  return (
    <motion.div
                initial={{ x:100, opacity: 0}}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="w-full h-full"
              >
    <PageWrapper backgroundImage="/images/edit-bk.webp">
      <div className="flex flex-col justify-center items-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white/20 dark:bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg p-6 text-green-500 dark:text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center">✏️ Edit Your Carbon Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* FOOD SECTION */}
            <div>
              <h3 className="font-semibold mb-2 ">🍽️ Food</h3>
              <label className="block mb-1 text-sm ">Type:</label>
              <select
  name="type"
  value={form.food?.type || ''}
  onChange={(e) => setForm({ ...form, food: { ...form.food, type: e.target.value } })}
  className="w-full bg-white/10 dark:bg-black/30 text-emerald-600 dark:text-gray-100 
             border border-emerald-400 focus:outline-none py-2 px-3 rounded-md 
             backdrop-blur-sm transition duration-300 appearance-none 
             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
>
  <option value="">-- Select --</option>
  <option value="Animal based">Animal based 🍖</option>
  <option value="Plant based">Plant based 🪴</option>
  <option value="Both">Mixed 🍔</option>
</select>

              <label className="block mt-2 mb-1 text-sm">Amount (kg):</label>
               <input
      type="number"
      placeholder="Amount (kg)"
      value={form.food.amountKg}
      onChange={(e) => handleChange('food', 'amountKg', e.target.value)}
      className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                 text-emerald-600 dark:text-gray-100"
    />
            </div>

           {/* Transport Section */}
<div>
  <label className="block mb-1 text-emerald-500 dark:text-gray-100">Transport 🛸</label>
  {form.transport.map((t, i) => (
    <div key={i} className="space-y-2 mb-2">
      <select
        name="mode"
        value={t.mode}
        onChange={(e) => handleChange('transport', 'mode', e.target.value, i)}
        className="w-full bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 
                   border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md 
                   backdrop-blur-sm transition duration-300 appearance-none 
                   focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      >
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
        placeholder="Distance (km)"
        value={t.distanceKm}
        onChange={(e) => handleChange('transport', 'distanceKm', e.target.value, i)}
        className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-500 dark:text-gray-100"
      />
    </div>
  ))}
</div>


            {/* Electricity Section */}
<div>
  <label className="block mb-1 text-emerald-500 dark:text-gray-100">Electricity ⚡</label>
  {form.electricity.map((el, i) => (
    <div key={i} className="space-y-2 mb-2">
      <select
        name="source"
        value={el.source}
        onChange={(e) => handleChange('electricity', 'source', e.target.value, i)}
        className="w-full bg-white/10 dark:bg-black/30 text-emerald-500 dark:text-gray-100 
                   border-b border-emerald-500 focus:outline-none py-2 px-3 rounded-md 
                   backdrop-blur-sm transition duration-300 appearance-none 
                   focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      >
        <option value="">-- Source --</option>
        <option value="Coal">Coal 🔥</option>
        <option value="Solar">Solar ☀️</option>
        <option value="Wind">Wind ༄</option>
        <option value="Hydro">Hydro 🌊</option>
        <option value="Mixed">Mixed 𓇼</option>
      </select>
      <input
        type="number"
        placeholder="Consumption (kWh)"
        value={el.consumptionKwh}
        onChange={(e) => handleChange('electricity', 'consumptionKwh', e.target.value, i)}
        className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-500 dark:text-gray-100"
      />
    </div>
  ))}
</div>


            {/* WASTE */}
            <div>
              <h3 className="font-semibold mb-2">🗑️ Waste</h3>
              {form.waste.map((w, i) => (
                <div key={i} className="mb-2">
                  <label className="block text-sm">Plastic (kg):</label>
                  <input
        type="number"
        placeholder="Plastic (kg)"
        value={w.plasticKg}
        onChange={(e) => handleChange('waste', 'plasticKg', e.target.value, i)}
        className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      />
      <input
        type="number"
        placeholder="Paper (kg)"
        value={w.paperKg}
        onChange={(e) => handleChange('waste', 'paperKg', e.target.value, i)}
        className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      />
      <input
        type="number"
        placeholder="Food Waste (kg)"
        value={w.foodWasteKg}
        onChange={(e) => handleChange('waste', 'foodWasteKg', e.target.value, i)}
        className="w-full bg-transparent border-b border-emerald-500 focus:outline-none py-1 
                   text-emerald-600 dark:text-gray-100"
      />
                </div>
              ))}
            </div>
{success && <p className="text-green-500 text-sm text-center animate-pulse">{success}</p>}
{error && <p className="text-red-500 text-sm text-center animate-bounce">{error}</p>}

            {/* SUBMIT */}
            <button
  type="submit"
  disabled={saving}
  className="w-full py-2 mt-4 font-semibold text-emerald-500 dark:text-white bg-transparent border border-white rounded hover:bg-emerald-700 dark:hover:text-black hover:text-white transition duration-300 active:scale-75 flex items-center justify-center gap-2"
>
  {saving ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Saving...
    </>
  ) : success ? 'Saved' : '💾 Save Changes'}
</button>

          </form>
        </div>
      </div>
    </PageWrapper>
    </motion.div>
  );
};

export default EditFootprintForm;
