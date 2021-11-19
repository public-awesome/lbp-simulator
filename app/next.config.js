module.exports = {
  target: 'serverless',
  async rewrites() {
    const dev = [
      {
        source: '/api/:slug*',
        destination: `http://localhost:8080/api/:slug*`,
      },
    ];
    const prod = [
      {
        source: '/api/:slug*',
        destination: `https://patdxamgr2.us-east-1.awsapprunner.com/api/:slug*`,
      },
    ];
    return process.env.NODE_ENV === 'production' ? prod : dev;
  },
};
