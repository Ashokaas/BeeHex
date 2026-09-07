type ArrayHash = String

export class ArrayCache {
    private cache: Map<ArrayHash, Array<number>>;

    constructor() {
        this.cache = new Map<ArrayHash, Array<number>>();
    }

    getFromOne(array: Array<number>, index: number, value: number): Array<number> {
        let hash = ArrayCache.hashArrayFromOne(array, index, value);
        if (this.cache.has(hash)) {
            return this.cache.get(hash)!;
        } else {
            let newArray = array.slice();
            newArray[index] = value;
            this.cache.set(hash, newArray);
            return newArray;
        }
    }

    static hashArrayFromOne(array: Array<number>, index: number, value: number): ArrayHash { // passer ceci à du base 36
        let hash = BigInt(0)
        let ii = BigInt(1)
        for (let i = 0; i < array.length; i++) {
            if (i === index) {
                hash += BigInt(value) * ii
                ii *= BigInt(3)
            } else {
                hash += BigInt(array[i]) * ii
                ii *= BigInt(3)
            }
        }
        let finalHash = hash.toString(36)
        return finalHash
    }
}

export function hashArray(array: Array<number>): ArrayHash { // passer ceci à du base 36
    let hash = BigInt(0)
    let ii = BigInt(1)
	for (let j of array) {
		hash += BigInt(j) * ii
        ii *= BigInt(3)
	} 
	let finalHash = hash.toString(36)
	return finalHash 
}