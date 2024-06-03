/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        //dette er den gamle måten. må fikses senere
        domains: ["unsplash.com"],

    /** 
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'unsplash.com',
            port: '',
            pathname: '/photos/**',
          },
        ],
        */
      },
      
};

export default nextConfig;
