module.exports = {
    apps: [
      {
        name: 'myapp',
        script: 'app.js', // Remplacez par le point d'entrée de votre application
        interpreter: 'nodemon',
        watch: true, // Active la surveillance des changements
        instances: '30', // Utilise autant de processus que de cœurs CPU
        exec_mode: 'cluster', // Active le mode cluster pour plusieurs processus
        env: {
          NODE_ENV: 'development',
        },
      },
    ],
  };
  