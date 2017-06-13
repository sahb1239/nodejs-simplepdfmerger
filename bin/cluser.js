var cluster = require('cluster');

if (cluster.isMaster) {
    var numCPUs = require('os').cpus().length;

    console.log('Creating ' + numCPUs + ' workers...');

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        if (code != 0) {
            console.log('Worker %d died (%s). restarting...',
                worker.process.pid, signal || code);

            cluster.fork();
        }
    });
} else if (cluster.isWorker) {
    console.log('Starting working %d PID: %d', cluster.worker.id, cluster.worker.process.pid);
    require('./www');
}