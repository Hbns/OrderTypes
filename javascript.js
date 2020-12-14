var ot_data = {};
var data_ot9_ready = false;
var extrem_09_ready = false;

/**
 * Loads a portion of the files to search through of the database
 */
async function getBlobs() {
    const [ot3, ot4, ot5, ot6, ot7, ot8, ot9] = await Promise.all([
        fetch('/ot_data/otypes/otypes03.b08'),
        fetch('/ot_data/otypes/otypes04.b08'),
        fetch('/ot_data/otypes/otypes05.b08'),
        fetch('/ot_data/otypes/otypes06.b08'),
        fetch('/ot_data/otypes/otypes07.b08'),
        fetch('/ot_data/otypes/otypes08.b08'),
        fetch('/ot_data/otypes/otypes09.b16')
    ]);

    ot_data["otypes03_b08"] = await ot3.arrayBuffer();
    ot_data["otypes04_b08"] = await ot4.arrayBuffer();
    ot_data["otypes05_b08"] = await ot5.arrayBuffer();
    ot_data["otypes06_b08"] = await ot6.arrayBuffer();
    ot_data["otypes07_b08"] = await ot7.arrayBuffer();
    ot_data["otypes08_b08"] = await ot8.arrayBuffer();
    ot_data["otypes09_b16"] = await ot9.arrayBuffer();

    data_ot9_ready = true;
}

async function getBlobsExtremePoints() {
    const [extr3, extr4, extr5, extr6, extr7, extr8, extr9] = await Promise.all([
        fetch('/ot_data/extrem/extrem03.b08'),
        fetch('/ot_data/extrem/extrem04.b08'),
        fetch('/ot_data/extrem/extrem05.b08'),
        fetch('/ot_data/extrem/extrem06.b08'),
        fetch('/ot_data/extrem/extrem07.b08'),
        fetch('/ot_data/extrem/extrem08.b08'),
        fetch('/ot_data/extrem/extrem09.b08')
    ])

    ot_data["extrem03_b08"] = await extr3.arrayBuffer();
    ot_data["extrem04_b08"] = await extr4.arrayBuffer();
    ot_data["extrem05_b08"] = await extr5.arrayBuffer();
    ot_data["extrem06_b08"] = await extr6.arrayBuffer();
    ot_data["extrem07_b08"] = await extr7.arrayBuffer();
    ot_data["extrem08_b08"] = await extr8.arrayBuffer();
    ot_data["extrem09_b08"] = await extr9.arrayBuffer();

    extrem_09_ready = true;
}

////////////////////

class Point {
    constructor() {
        let x, y, range = 255, color = "#888888";
        switch (arguments.length) {
            case 1:
                x = arguments[0].x;
                y = arguments[0].y;
                break;
            case 4:
                color = arguments[3];
            case 3:
                range = arguments[2];
            case 2:
                x = arguments[0];
                y = arguments[1];
                break;
        }
        this.x = x;
        this.y = y;
        this.range = range;
        this.color = color;
    }

    setRange(range) {
        let newX = (this.x / this.range) * range;
        let newY = (this.y / this.range) * range;
        this.x = newX;
        this.y = newY;
        this.range = range;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}

function minLambdaMatrixString(pointSet) {
    let CH = grahamScan(pointSet);
    let minMatrix = undefined;

    // try each point on CH as pivot
    for (let pivotId in CH) {
        let tmpMatrix = "";
        let pivotPoint = CH[pivotId];
        let ordered = orderRadially(pointSet, pivotPoint);
        let reversed = [ordered[0]].concat(ordered.slice(1).reverse());

        for (let i in reversed) {
            for (let j in reversed) {
                tmpMatrix += nbPointsLeftOf(reversed[i], reversed[j], reversed);
            }
        }

        if (minMatrix === undefined || tmpMatrix.localeCompare(minMatrix) < 0) {
            minMatrix = tmpMatrix;
        }
    }

    return minMatrix;
}

/**
 * 
 * @param {*} arr 
 * @param {*} left 
 */
function _lambdaMatrixStr(arr, left = true) {
    let matrix = "";
    for (let row = 0; row < arr.length; row++) {
        for (let col = 0; col < arr.length; col++) {
            if (row !== col) {
                matrix += nbPointsLeftOf(arr[row], arr[col], arr, left);
            } else {
                matrix += "0";
            }
        }
    }
    return matrix;
}

/**
 * Function that replaces an array of indices to objects by the objects themselves
 * @param {number[]} indices the list of indices to replace
 * @param {[]} arr the objects
 */
function derefIndices(indices, arr) {
    let out = [];
    for (let i in indices) {
        out.push(arr[indices[i]]);
    }
    return out;
}

/**
 * https://www.youtube.com/watch?v=VVPUAUVbjfM
 * @param {number[]} arr an array of numbers 
 */
function nextPermutation(arr) {
    // find peak
    let peak;
    for (let i = arr.length; i >= 0; i--) {
        if (i === 0) {
            return undefined;
        }

        if (arr[i] > arr[i - 1]) {
            peak = i;
            break;
        }
    }

    // find largest number on right of peak
    for (let j = arr.length - 1; j >= 0; j--) {
        if (arr[j] > arr[peak - 1]) {
            let temp = arr[j];
            arr[j] = arr[peak - 1];
            arr[peak - 1] = temp;
            break;
        }
    }

    // reverse from peak to end of arr
    let start = peak;
    let end = arr.length - 1;
    while (start < end) {
        let temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
    return arr;
}

/**
 * Computes the number of points different from point1 and point2 in points that are to the left of the line point1-point2
 * @param {Point} point1 first point of the line
 * @param {Point} point2 second point of the line
 * @param {Point[]} points the set complete set of points
 * @param {boolean} left indicated the direction of the turn with the line
 */
function nbPointsLeftOf(point1, point2, points, left = true) {
    let nbLeft = 0;
    for (let i in points) {
        let point = points[i];
        if (!point.equals(point1) && !point.equals(point2)) {
            if (orientationDet(point1, point2, point) > 0) {
                if (left) {
                    nbLeft++;
                }
            } else if (!left) {
                nbLeft++;
            }
        }
    }
    return nbLeft;
}

/**
 * Computes the orientation determinant of three points
 */
function orientationDet(a, b, c) {
    return b.x * c.y - a.x * c.y + a.x * b.y - b.y * c.x + a.y * c.x - a.y * b.x;
}

function readOtypeDataset(nbPoints) {
    let arr;
    if (nbPoints === 9) {
        let pts = ("0" + nbPoints).slice(-2);
        arr = new Uint16Array(ot_data[`otypes${pts}_b16`]);
    } else if (nbPoints < 9) {
        arr = new Uint8Array(ot_data[`otypes0${nbPoints}_b08`]);
    } else {
        console.log("unhandled number of points");
        arr = undefined;
    }
    return arr;
}

/**
 * Binary search for the point corresponding to the order type of the given lambda matrix 
 * @param {number} nbPoints the size of the order type
 * @param {string} minLambdaMatrixString the lambda matrix flattended into a string (row after row)
 * @returns {Point[]} the point set realisation corresponding to the given lambda matrix contained in the database or undefined if it wasn't found
 */
function binSearchOt(nbPoints, inputLambdaMatrix) {
    let arr = readOtypeDataset(nbPoints);
    let entrySize = nbPoints * 2; // n points of 2 coordinates
    let lastEntryIndex = (arr.length / entrySize) - 1;
    return _recBinSearchOt(arr, 0, lastEntryIndex, nbPoints, inputLambdaMatrix);
}

/**
 * Recursive helper function for a binary search on order types
 * lo and hi are point set entry offsets
 */
function _recBinSearchOt(arr, lo, hi, nbPoints, inputLambdaMatrix) {
    let midPoint = Math.floor((lo + hi) / 2);
    let pointSet = readPointSet(arr, midPoint, nbPoints);
    let midPointMatrix = minLambdaMatrixString(pointSet);
    let res = midPointMatrix.localeCompare(inputLambdaMatrix);
    console.log(lo, hi);
    console.log(midPointMatrix, inputLambdaMatrix, res);

    if (lo === hi) {
        if (res === 0) {
            return { points: pointSet, index: lo };
        } else {
            return undefined;
        }
    }

    if (res === 0) {
        return { points: pointSet, index: midPoint };
    } else if (res < 0) {
        return _recBinSearchOt(arr, midPoint + 1, hi, nbPoints, inputLambdaMatrix);
    } else {
        return _recBinSearchOt(arr, lo, midPoint, nbPoints, inputLambdaMatrix);
    }
}

/**
 * //TODO
 * @param {*} arr 
 * @param {*} offset 
 * @param {*} nbPoints 
 */
function readPointSet(arr, offset, nbPoints) {
    let points = [];
    let nbBytes = nbPoints < 9 ? 1 : 2;
    let range = nbPoints < 9 ? 255 : 65535;
    let entrySize = nbPoints * 2;
    for (let i = 0; i < nbPoints; i++) {
        let pointStart = (offset * entrySize) + i * 2;
        let xBig = arr[pointStart];
        let yBig = arr[pointStart + 1];
        //points.push(new Point(swapEndian(xBig, nbBytes), swapEndian(yBig, nbBytes), range)); // BigEndian to LittleEndian
        points.push(new Point(xBig, yBig, range));
    }
    return points;
}

/**
 * Changes the endianess of an interger
 * @param {*} num the number
 * @param {*} nbBytes the number of bytes the number is encoded on (1,2 or 4)
 */
function swapEndian(num, nbBytes) {
    if (nbBytes === 1) {
        return num;
    } else if (nbBytes === 2) {
        return ((num & 0xFF) << 8) | ((num >> 8) & 0xFF);
    } else if (nbBytes === 4) {
        return ((num & 0xFF) << 24) | ((num & 0xFF00) << 8) | ((num >> 8) & 0xFF00) | ((num >> 24) & 0xFF);
    }
}

/**
 * Returns all the idices of the point set entries of size n that have chSize extreme points 
 * @param {Number} n 
 * @param {Number} chSize 
 */
function searchByChSize(n, chSize) {
    let key = "extrem0" + n + "_b08";
    let arr = new Uint8Array(ot_data[key]);
    let res = [];
    try {
        for (let i in arr) {
            if (Number(arr[i]) === chSize) {
                res.push(i);
            }
        }
    } catch (e) {
        console.error(e);
    }
    return res;
}

/**
 * Returns all the idices of the point set entries of size n that have chSize extreme points
 * @param {Number} n
 * @param {Number} layers
 */
function searchByConvexLayers(n, layers) {
    let key = "extrem0" + n + "_b08";
    let arr = new Uint8Array(ot_data[key]);
    let res = [];
    try {
        for (let i in arr) {
            let supposition;
            // an exterior convex layer has at least 3 points ->
            // if the number of points left after excluding the extremities
            // is <= 3, then at most one other convex layer exists
            if (n === arr[i]) {
                supposition = 1;
            } else if (n - arr[i] <= 3) {
                supposition = 2;
            } else {
                // recursive algo
                supposition = 0;
                let points = readPointSet(readOtypeDataset(n), i, n);
                while (points.length >= 3) {
                    let ch = grahamScan(points);
                    points = points.filter(x => !ch.includes(x));
                    supposition++;
                }
                if (points.length > 0) supposition++;
            }
            if (supposition === layers) res.push(i);
        }
    } catch (e) {
        console.error(e);
    }
    return res;
}