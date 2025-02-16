import fetch from 'node-fetch';

const url = 'https://campussociety.onrender.com/health-check';

const pingServer = async () => {
  try {
    const response = await fetch(url);
    console.log(`Health check: ${response.status}`);
  } catch (error) {
    console.error('Error pinging server:', error);
  }
};

pingServer();
