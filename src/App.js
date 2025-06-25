import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [postcode, setPostcode] = useState('');
  const [carbonData, setCarbonData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [carbonRegionName, setCarbonRegionName] = useState('');
  const [carbonSavingTips, setCarbonSavingTips] = useState('');
  const [loadingTips, setLoadingTips] = useState(false);

  // Reads the API key from Vercel's Environment Variables.
  const OPENWEATHERMAP_API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setCarbonData(null);
    setWeatherData(null);
    setCarbonRegionName('');
    setCarbonSavingTips('');
    setShowErrorModal(false);

    if (!postcode) {
      setError("Please enter a postcode.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    const sanitizedPostcode = postcode.replace(/\s+/g, '');

    try {
      // 1. Get Latitude and Longitude from postcode.io for weather data
      console.log('Fetching postcode data...');
      const postcodeIoUrl = `https://api.postcodes.io/postcodes/${sanitizedPostcode}`;
      const postcodeResponse = await fetch(postcodeIoUrl);
      if (!postcodeResponse.ok) {
        throw new Error(`Invalid UK Postcode. Please check the postcode entered.`);
      }
      const postcodeJson = await postcodeResponse.json();
      const { latitude, longitude } = postcodeJson.result;

      // 2. Fetch Weather Data from OpenWeatherMap
      if (!OPENWEATHERMAP_API_KEY) {
        throw new Error('OpenWeatherMap API Key is not configured. Please add REACT_APP_OPENWEATHERMAP_API_KEY to your Vercel environment variables.');
      }
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        const weatherError = await weatherResponse.json();
        throw new Error(`Weather API Error: ${weatherError.message}`);
      }
      const weatherJson = await weatherResponse.json();
      setWeatherData(weatherJson);

      // 3. Fetch Carbon Intensity data
      const now = new Date();
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      console.log('Fetching carbon intensity data...');
      const regionalUrl = `https://api.carbonintensity.org.uk/regional/intensity/${from}/${to}/postcode/${sanitizedPostcode}`;
      const nationalUrl = `https://api.carbonintensity.org.uk/intensity/${from}/${to}`;

      const [regionalResponse, nationalResponse] = await Promise.all([
        fetch(regionalUrl),
        fetch(nationalUrl),
      ]);

      if (!regionalResponse.ok) {
        const errorJson = await regionalResponse.json();
        if (errorJson?.error?.message) {
          throw new Error(`Carbon Intensity API Error: ${errorJson.error.message}`);
        }
        throw new Error('Failed to fetch regional carbon data.');
      }
      if (!nationalResponse.ok) throw new Error('Failed to fetch national carbon data.');

      const regionalJson = await regionalResponse.json();
      const nationalJson = await nationalResponse.json();
      
      // ***FIX: Use optional chaining (?.) for robust nested data access to prevent crash on null values.***
      const regionDataContainer = regionalJson?.data?.[0]?.data?.[0];
      const nationalIntensityData = nationalJson?.data;

      // Check if the necessary data structures exist after safe access
      if (!regionDataContainer || !regionDataContainer.data || !nationalIntensityData) {
        throw new Error('Carbon Intensity API returned an unexpected or incomplete data structure for this region.');
      }

      const regionName = regionDataContainer.shortname;
      const regionalIntensityData = regionDataContainer.data;
      
      setCarbonRegionName(regionName);

      const nationalMap = new Map();
      nationalIntensityData.forEach(item => nationalMap.set(item.from, item.intensity.forecast));

      const mergedData = regionalIntensityData
        .map(regionalItem => ({
          isoTime: regionalItem.from,
          localIntensity: regionalItem.intensity.forecast,
          nationalIntensity: nationalMap.get(regionalItem.from) || null,
        }))
        .filter(item => item.localIntensity !== null && item.nationalIntensity !== null)
        .sort((a, b) => new Date(a.isoTime) - new Date(b.isoTime))
        .map(item => ({
          ...item,
          time: new Date(item.isoTime).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        }));

      setCarbonData(mergedData);

    } catch (err) {
      console.error("Error during data fetch:", err);
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const getCarbonTips = async () => {
    setLoadingTips(true);
    setCarbonSavingTips('');
    try {
      if (!carbonData || carbonData.length === 0) {
        throw new Error("No carbon intensity data available to generate tips.");
      }
      
      const now = new Date().getTime();
      const latestCarbon = carbonData.reduce((prev, curr) => {
          const prevDiff = Math.abs(new Date(prev.isoTime).getTime() - now);
          const currDiff = Math.abs(new Date(curr.isoTime).getTime() - now);
          return currDiff < prevDiff ? curr : prev;
      });

      const currentLocalIntensity = latestCarbon.localIntensity;
      const currentNationalIntensity = latestCarbon.nationalIntensity;

      const prompt = `Given that the current carbon intensity in ${carbonRegionName} is ${currentLocalIntensity} gCO2/kWh (compared to a national average of ${currentNationalIntensity} gCO2/kWh), provide 3 concise and actionable tips for a UK household to reduce their electricity carbon footprint. Format the response as a simple list.`;

      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = ""; // Provided by Canvas at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API call failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        setCarbonSavingTips(text);
      } else {
        throw new Error("Gemini API returned an unexpected response structure.");
      }

    } catch (err) {
      console.error("Error generating carbon tips:", err);
      setError(`Failed to generate tips: ${err.message}`);
      setShowErrorModal(true);
    } finally {
      setLoadingTips(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 text-gray-800">

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={closeErrorModal}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-4xl my-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          UK Grid Carbon & Weather
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter UK Postcode (e.g., SW1A 0AA)"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && fetchData()}
          />
          <button
            onClick={fetchData}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-lg transition text-white ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
          >
            {loading ? 'Loading...' : 'Get Data'}
          </button>
        </div>

        {weatherData && weatherData.weather && weatherData.weather[0] && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-20 h-20 mr-4"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Weather"; }}
              />
              <div>
                <h2 className="text-3xl font-bold">{weatherData.name}</h2>
                <p className="text-xl capitalize">{weatherData.weather[0].description}</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-4xl font-extrabold">{Math.round(weatherData.main.temp)}°C</p>
              <p className="text-lg">Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
              <p className="text-lg">Humidity: {weatherData.main.humidity}%</p>
            </div>
          </div>
        )}

        {carbonData && carbonData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Carbon Intensity (gCO₂/kWh)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={carbonData}
                margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12, fill: '#666' }}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  label={{ value: 'gCO2/kWh', angle: -90, position: 'insideLeft', fill: '#666' }}
                  tick={{ fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                  formatter={(value, name) => [`${value}`, name === 'localIntensity' ? `Your Area (${carbonRegionName})` : 'National Average']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="localIntensity"
                  stroke="#8884d8"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name={`Your Area (${carbonRegionName})`}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="nationalIntensity"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="National Average"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-8 text-center">
              <button
                onClick={getCarbonTips}
                disabled={loadingTips || !carbonData}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition flex items-center justify-center mx-auto text-white ${loadingTips || !carbonData ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md'}`}
              >
                {loadingTips ? 'Generating...' : 'Get Carbon Saving Tips ✨'}
              </button>
              {carbonSavingTips && (
                <div className="