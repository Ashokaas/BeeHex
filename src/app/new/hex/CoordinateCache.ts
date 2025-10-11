type Coordinate = [number, number]
type CoordinateMaps = Map<number, Coordinate>

export class CoordinateCache {
	private cache: CoordinateMaps;
	private n: number;
	constructor(n: number) {
		this.n = n;
		this.cache = new Map<number, Coordinate>();
		for (let i = -1; i < n + 1; i++) {
			for (let j = -1; j < n + 1; j++) {
				this.cache.set(this.hash(i, j), [i, j]);
			}
		}
	}

	get(x: number, y: number): Coordinate {
		return this.cache.get(this.hash(x, y))!;
	}

	getFromCoordinate(coord: Coordinate): Coordinate {
		return this.get(coord[0], coord[1]);
	}

	hash(x: number, y: number): number {
		return x + y * this.n * 2;
	}
}