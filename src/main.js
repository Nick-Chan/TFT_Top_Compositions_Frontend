import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';

// Set up Axios base URL
axios.defaults.baseURL = 'https://localhost:7057/api';

// Create and mount the app
createApp(App).mount('#app');
