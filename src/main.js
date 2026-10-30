import { createStandaloneApplication } from './standalone/application.js';
import { describeError } from './standalone/errors.js';
import { t } from './i18n/index.js';
import { initOmegaWorkspace } from './omega/omegaWorkspace.js';

const application = createStandaloneApplication({
  googleApiKey: import.meta.env.GOOGLE_MAPS_API_KEY,
  cesiumToken: import.meta.env.CESIUM_ION_TOKEN,
  allowQaRegistration: import.meta.env.DEV,
});

application.start().then(() => {
  initOmegaWorkspace();
}).catch((error) => {
  console.error("God's Eye View initialization failed:", error);
  const loaderStatus = document.querySelector('#loading-screen .loader-status');
  if (loaderStatus) {
    loaderStatus.textContent = t('Error: {message}', {
      message: describeError(error),
    });
    loaderStatus.style.color = '#ff4444';
  }
});

export { application };
