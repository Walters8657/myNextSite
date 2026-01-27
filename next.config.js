const path = require('path')

const nextConfig = {
  // ... other configurations
  webpack: (config, { isServer }) => {
    // Resolve the 'dgram' module on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback
        ,dgram: false
      };
      config.resolve.fallback = {
        ...config.resolve.fallback
        ,tls: false
      };
    }
    return config;
  },
};
 
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@use "@/app/variables.scss" as *;`
  },
}