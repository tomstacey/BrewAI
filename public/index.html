import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [postcode, setPostcode] = useState('');
  const [carbonData, setCarbonData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [carbonRegionName, setCarbonRegionName] = useState(''); // To store region name for LLM prompt
  const [carbonSavingTips, setCarbonSavingTips] = useState(''); // To store LLM generated tips
  const [loadingTips, setLoadingTips] = useState(false); // Loading state for LLM tips

  // IMPORTANT: Replace 'YOUR_OPENWEATHERMAP_API_KEY' with your actual key.
  const OPENWEATHERMAP_API_KEY = '095d54ffa1732d9bd45d0850923af4ad';

  // Function to close error modal
  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setCarbonData(null);
    setWeatherData(null);
    setCarbonRegionName(''); // Clear previous region name
    setCarbonSavingTips(''); // Clear previous tips
    setShowErrorModal(false);

    if (!postcode) {
      setError("Please enter a postcode.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    try {
      // 1. Get Latitude and Longitude from postcode.io for weather data
      console.log('Fetching postcode data...');
      const postcodeIoUrl = `https://api.postcodes.io/postcodes/${postcode}`;
      const postcodeResponse = await fetch(postcodeIoUrl);

      if (!postcodeResponse.ok) {
        throw new Error(`Failed to fetch postcode data from ${postcodeIoUrl}: ${postcodeResponse.status} ${postcodeResponse.statusText}`);
      }
      const postcodeJson = await postcodeResponse.json();
      console.log('Postcode data received:', postcodeJson);

      if (postcodeJson.status !== 200 || !postcodeJson.result) {
        throw new Error('Invalid UK Postcode. Please try again or check the postcode entered.');
      }
      const { latitude, longitude } = postcodeJson.result;

      // 2. Fetch Weather Data from OpenWeatherMap
      if (OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY' || !OPENWEATHERMAP_API_KEY) {
        setError('OpenWeatherMap API Key is missing or default. Please replace "YOUR_OPENWEATHERMAP_API_KEY" in the code with your actual API key.');
        setShowErrorModal(true);
        setLoading(false); // Stop loading if API key is not set
        return;
      } else {
        console.log('Fetching weather data...');
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
          // Attempt to parse error message from OpenWeatherMap if available
          const weatherErrorText = await weatherResponse.text();
          let errorMessage = `Failed to fetch weather data from ${weatherUrl}: ${weatherResponse.status} ${weatherResponse.statusText}.`;
          try {
            const errorJson = JSON.parse(weatherErrorText);
            if (errorJson.message) {
              errorMessage += ` API Message: ${errorJson.message}`;
            }
          } catch (e) {
            // Not a JSON error, use plain text
            errorMessage += ` Response: ${weatherErrorText.substring(0, 100)}...`; // Truncate long responses
          }
          throw new Error(errorMessage + ' Check your API key or network.');
        }
        const weatherJson = await weatherResponse.json();
        console.log('Weather data received:', weatherJson);

        if (weatherJson.cod && weatherJson.cod !== 200) {
          // OpenWeatherMap often uses 'cod' for status even if HTTP status is 200 for some errors (e.g. invalid API key)
          throw new Error(`Weather API returned an error: ${weatherJson.message}. Please verify your OpenWeatherMap API key.`);
        }
        setWeatherData(weatherJson);
      }

      // 3. Get Carbon Intensity Region ID and Name from Carbon Intensity API
      console.log('Fetching carbon intensity region ID...');
      const carbonRegionalIdUrl = `https://api.carbonintensity.org.uk/regional/postcode/${postcode}`;
      const carbonRegionalIdResponse = await fetch(carbonRegionalIdUrl);

      if (!carbonRegionalIdResponse.ok) {
        throw new Error(`Failed to fetch carbon region ID from ${carbonRegionalIdUrl}: ${carbonRegionalIdResponse.status} ${carbonRegionalIdResponse.statusText}`);
      }
      const carbonRegionalIdJson = await carbonRegionalIdResponse.json();
      console.log('Carbon region ID data received:', carbonRegionalIdJson);

      if (!carbonRegionalIdJson.data || carbonRegionalIdJson.data.length === 0 || !carbonRegionalIdJson.data[0].regionid) {
        throw new Error('Could not determine carbon intensity region for this postcode. Please ensure it is a valid UK postcode.');
      }
      const regionId = carbonRegionalIdJson.data[0].regionid;
      const regionName = carbonRegionalIdJson.data[0].region;
      setCarbonRegionName(regionName); // Store region name
      console.log('Region ID:', regionId, 'Region Name:', regionName);

      // Calculate time windows for 24 hours historical and 24 hours forecast
      const now = new Date();
      // Adjust 'now' to be rounded to the nearest half-hour mark for API consistency
      // The API provides data in 30-minute intervals. Rounding `now` to the nearest half-hour
      // helps in aligning the 'from' and 'to' parameters for API calls.
      const minutes = now.getMinutes();
      if (minutes < 15) {
        now.setMinutes(0, 0, 0);
      } else if (minutes < 45) {
        now.setMinutes(30, 0, 0);
      } else {
        now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1);
      }

      const historicalFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + 'Z'; // 24 hours ago, rounded to minute
      const historicalTo = now.toISOString().slice(0, 16) + 'Z'; // current time, rounded to minute
      const forecastTo = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) + 'Z'; // 24 hours from now, rounded to minute

      // 4. Fetch Carbon Intensity Data: Regional Historical, Regional Forecast, National Historical, National Forecast

      // Regional Historical
      console.log('Fetching regional historical carbon data...');
      const regionalHistoryUrl = `https://api.carbonintensity.org.uk/intensity/${regionId}/${historicalFrom}/${historicalTo}`;
      const regionalHistoryResponse = await fetch(regionalHistoryUrl);
      if (!regionalHistoryResponse.ok) throw new Error(`Failed to fetch regional historical carbon data from ${regionalHistoryUrl}: ${regionalHistoryResponse.status}`);
      const regionalHistoryJson = await regionalHistoryResponse.json();
      console.log('Regional historical data:', regionalHistoryJson);

      // Regional Forecast
      console.log('Fetching regional forecast carbon data...');
      const regionalForecastUrl = `https://api.carbonintensity.org.uk/intensity/forecast/${regionId}/${historicalTo}/${forecastTo}`;
      const regionalForecastResponse = await fetch(regionalForecastUrl);
      if (!regionalForecastResponse.ok) throw new Error(`Failed to fetch regional forecast carbon data from ${regionalForecastUrl}: ${regionalForecastResponse.status}`);
      const regionalForecastJson = await regionalForecastResponse.json();
      console.log('Regional forecast data:', regionalForecastJson);

      // National Historical
      console.log('Fetching national historical carbon data...');
      const nationalHistoryUrl = `https://api.carbonintensity.org.uk/intensity/national/${historicalFrom}/${historicalTo}`;
      const nationalHistoryResponse = await fetch(nationalHistoryUrl);
      if (!nationalHistoryResponse.ok) throw new Error(`Failed to fetch national historical carbon data from ${nationalHistoryUrl}: ${nationalHistoryResponse.status}`);
      const nationalHistoryJson = await nationalHistoryResponse.json();
      console.log('National historical data:', nationalHistoryJson);

      // National Forecast
      console.log('Fetching national forecast carbon data...');
      const nationalForecastUrl = `https://api.carbonintensity.org.uk/intensity/forecast/national/${historicalTo}/${forecastTo}`;
      const nationalForecastResponse = await fetch(nationalForecastUrl);
      if (!nationalForecastResponse.ok) throw new Error(`Failed to fetch national forecast carbon data from ${nationalForecastUrl}: ${nationalForecastResponse.status}`);
      const nationalForecastJson = await nationalForecastResponse.json();
      console.log('National forecast data:', nationalForecastJson);


      // Combine and format data for the chart
      const regionalCombined = [
        ...(regionalHistoryJson.data || []),
        ...(regionalForecastJson.data || [])
      ].map(item => ({
        time: item.from, // Use ISO string to ensure consistent sorting later
        intensity: item.intensity.actual || item.intensity.forecast,
      }));

      const nationalCombined = [
        ...(nationalHistoryJson.data || []),
        ...(nationalForecastJson.data || [])
      ].map(item => ({
        time: item.from, // Use ISO string
        intensity: item.intensity.actual || item.intensity.forecast,
      }));

      // Create a map for quick lookup of national intensity by time
      const nationalMap = new Map();
      nationalCombined.forEach(item => nationalMap.set(item.time, item.intensity));

      // Merge regional and national data, ensuring all points are present and sorted
      const mergedData = regionalCombined.map(regionalItem => ({
        time: new Date(regionalItem.time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        localIntensity: regionalItem.intensity,
        nationalIntensity: nationalMap.get(regionalItem.time) || null,
      })).sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time

      setCarbonData(mergedData);

    } catch (err) {
      console.error("Error during data fetch:", err); // Log the full error object
      setError(err.message);
      setShowErrorModal(true);
      setCarbonData(null);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getCarbonTips = async () => {
    setLoadingTips(true);
    setCarbonSavingTips('');
    try {
      if (!carbonData || carbonData.length === 0) {
        throw new Error("No carbon intensity data available to generate tips. Please fetch data first.");
      }

      // Get the latest carbon intensity (either actual or forecast)
      const latestCarbon = carbonData[carbonData.length - 1];
      const currentLocalIntensity = latestCarbon.localIntensity;
      const currentNationalIntensity = latestCarbon.nationalIntensity;

      const prompt = `Given that the current carbon intensity in ${carbonRegionName} is ${currentLocalIntensity} gCO2/kWh (compared to a national average of ${currentNationalIntensity} gCO2/kWh), provide 3 concise tips for how a household can reduce their electricity carbon footprint or shift their energy usage to greener times in the UK. Focus on practical, actionable advice.`;

      console.log("Sending prompt to Gemini API:", prompt);

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this at runtime for gemini-2.0-flash
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Gemini API response:", result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setCarbonSavingTips(text);
      } else {
        throw new Error("Gemini API returned an unexpected response structure or no content.");
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans text-gray-800">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Tailwind config for Inter font */}
      <style>{`
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={closeErrorModal}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* App Container */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-4xl mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          UK Grid Carbon & Weather
        </h1>

        {/* Postcode Input */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter UK Postcode (e.g., SW1A 0AA)"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchData();
              }
            }}
          />
          <button
            onClick={fetchData}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-lg transition duration-200
              ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}
          >
            {loading ? 'Loading...' : 'Get Data'}
          </button>
        </div>

        {/* Weather Data Display */}
        {weatherData && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="flex items-center mb-4 md:mb-0">
              {/* Weather Icon (simplified, could use actual icons from OWM) */}
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-20 h-20 mr-4"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Weather"; }}
              />
              <div>
                <h2 className="text-3xl font-bold">
                  {weatherData.name}
                </h2>
                <p className="text-xl capitalize">{weatherData.weather[0].description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-extrabold">{Math.round(weatherData.main.temp)}°C</p>
              <p className="text-lg">Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
              <p className="text-lg">Humidity: {weatherData.main.humidity}%</p>
            </div>
          </div>
        )}

        {/* Carbon Intensity Chart */}
        {carbonData && carbonData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 animate-fade-in mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Carbon Intensity (Last 24h & Next 24h)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={carbonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12, fill: '#666' }}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis
                  label={{ value: 'Carbon Intensity (gCO2/kWh)', angle: -90, position: 'insideLeft', fill: '#666' }}
                  tick={{ fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                  itemStyle={{ color: '#555' }}
                  formatter={(value, name, props) => [`${value} gCO2/kWh`, name === 'localIntensity' ? 'Your Area' : 'National Average']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="localIntensity"
                  stroke="#8884d8"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Your Area"
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

            {/* Gemini API Integration: Carbon Saving Tips */}
            <div className="mt-8 text-center">
              <button
                onClick={getCarbonTips}
                disabled={loadingTips || !carbonData}
                className={`px-6 py-3 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center mx-auto
                  ${loadingTips || !carbonData ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'}`}
              >
                {loadingTips ? 'Generating Tips...' : 'Get Carbon Saving Tips ✨'}
              </button>
              {carbonSavingTips && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 text-left text-gray-800 animate-fade-in">
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">Your Carbon Saving Tips:</h3>
                  <p className="whitespace-pre-wrap">{carbonSavingTips}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No data message */}
        {!loading && !carbonData && !weatherData && !error && (
          <div className="text-center text-gray-500 py-8">
            Enter a UK postcode above to see carbon intensity and weather data.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
