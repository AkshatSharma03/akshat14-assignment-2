document.addEventListener('DOMContentLoaded', () => {
    const numClustersInput = document.getElementById('num-clusters');
    const initMethodSelect = document.getElementById('init-method');
    const stepButton = document.getElementById('step-kmeans');
    const convergeButton = document.getElementById('converge-kmeans');
    const generateDatasetButton = document.getElementById('generate-dataset');
    const resetButton = document.getElementById('reset-algorithm');
    const plotDiv = document.getElementById('plot');

    let dataPoints = [];
    let centroids = [];
    let assignments = [];
    let numClusters = 3;

    // Helper functions
    function euclideanDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    // Generate a new dataset
    function generateDataset() {
        dataPoints = [];
        for (let i = 0; i < 200; i++) {
            dataPoints.push([Math.random() * 20 - 10, Math.random() * 20 - 10]);
        }
        initializeCentroids();
        plotData();
    }

    // Initialize centroids based on the selected method
    function initializeCentroids() {
        centroids = [];
        assignments = new Array(dataPoints.length).fill(-1);
        numClusters = parseInt(numClustersInput.value) || 3;

        if (initMethodSelect.value === 'random') {
            for (let i = 0; i < numClusters; i++) {
                centroids.push(dataPoints[getRandomInt(dataPoints.length)]);
            }
        } else if (initMethodSelect.value === 'farthest_first') {
            centroids.push(dataPoints[getRandomInt(dataPoints.length)]);
            while (centroids.length < numClusters) {
                let maxDist = 0;
                let nextCentroid = null;
                dataPoints.forEach(point => {
                    let minDist = Math.min(...centroids.map(c => euclideanDistance(c, point)));
                    if (minDist > maxDist) {
                        maxDist = minDist;
                        nextCentroid = point;
                    }
                });
                centroids.push(nextCentroid);
            }
        } else if (initMethodSelect.value === 'kmeans++') {
            centroids.push(dataPoints[getRandomInt(dataPoints.length)]);
            while (centroids.length < numClusters) {
                const distances = dataPoints.map(point => Math.min(...centroids.map(c => euclideanDistance(c, point))));
                const totalDistance = distances.reduce((acc, dist) => acc + dist, 0);
                const randomDistance = Math.random() * totalDistance;
                let cumulativeDistance = 0;
                for (let i = 0; i < distances.length; i++) {
                    cumulativeDistance += distances[i];
                    if (cumulativeDistance >= randomDistance) {
                        centroids.push(dataPoints[i]);
                        break;
                    }
                }
            }
        }

        // Enable the buttons for interaction
        stepButton.disabled = false;
        convergeButton.disabled = false;

        plotData();
    }

    // Assign data points to the nearest centroid
    function assignClusters() {
        assignments = dataPoints.map(point => {
            let distances = centroids.map(centroid => euclideanDistance(point, centroid));
            return distances.indexOf(Math.min(...distances));
        });
    }

    // Update centroids based on cluster assignments
    function updateCentroids() {
        centroids = centroids.map((centroid, clusterIndex) => {
            let assignedPoints = dataPoints.filter((_, i) => assignments[i] === clusterIndex);
            if (assignedPoints.length === 0) return centroid;
            let xSum = assignedPoints.reduce((acc, point) => acc + point[0], 0);
            let ySum = assignedPoints.reduce((acc, point) => acc + point[1], 0);
            return [xSum / assignedPoints.length, ySum / assignedPoints.length];
        });
    }

    // Perform one step of the KMeans algorithm
    function stepKMeans() {
        assignClusters();
        updateCentroids();
        plotData();
    }

    // Run KMeans to convergence
    function runToConvergence() {
        let previousAssignments = [];
        let isConverged = false;

        // Loop until convergence
        while (!isConverged) {
            previousAssignments = [...assignments];

            // Perform one step of KMeans
            stepKMeans();

            // Check for convergence
            isConverged = assignments.every((value, index) => value === previousAssignments[index]);
        }
    }

    // Plot data and centroids using Plotly
    function plotData() {
        console.log("Plotting data with centroids:", centroids);
        console.log("Current assignments:", assignments);

        const traces = [];

        // Plot data points with cluster color
        for (let i = 0; i < numClusters; i++) {
            const clusterPoints = dataPoints.filter((_, index) => assignments[index] === i);
            const x = clusterPoints.map(p => p[0]);
            const y = clusterPoints.map(p => p[1]);
            traces.push({
                x: x,
                y: y,
                mode: 'markers',
                type: 'scatter',
                marker: { size: 8 },
                name: `Cluster ${i + 1}`
            });
        }

        // Plot centroids
        traces.push({
            x: centroids.map(c => c[0]),
            y: centroids.map(c => c[1]),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12, color: 'black', symbol: 'cross' },
            name: 'Centroids'
        });

        Plotly.newPlot(plotDiv, traces, {
            title: 'KMeans Clustering Data',
            xaxis: { range: [-10, 10] },
            yaxis: { range: [-10, 10] }
        });
    }

    // Event listeners for user interaction
    generateDatasetButton.addEventListener('click', generateDataset);
    stepButton.addEventListener('click', stepKMeans);
    convergeButton.addEventListener('click', runToConvergence);
    resetButton.addEventListener('click', () => {
        centroids = [];
        assignments = [];
        stepButton.disabled = true;
        convergeButton.disabled = true;
        plotData();
    });
    numClustersInput.addEventListener('change', initializeCentroids);
    initMethodSelect.addEventListener('change', initializeCentroids);

    // Initialize with a random dataset
    generateDataset();
});