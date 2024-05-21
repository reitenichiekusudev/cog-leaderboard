import { pairObject } from "../pairs/pairObject.js"
export class User {
    public address: string
    private Points: bigint
    public v1PointsFinal: bigint
    public v2PointsFinal: bigint
    public v1PointsSnapshots: Array<bigint>
    public v2PointsSnapshots: Array<bigint>
    public borrowPairs: Array<pairObject>
    private borrowPairsMap: Map<string, pairObject>
    public depositPairs: Array<pairObject>
    private depositPairsMap: Map<string, pairObject>
    constructor(address: string, points: bigint) {
        this.address = address
        this.Points = points
        this.borrowPairs = []
        this.depositPairs = []
        this.v1PointsSnapshots = []
        this.v2PointsSnapshots = []
        this.v1PointsFinal = 0n
        this.v2PointsFinal = 0n
        this.borrowPairsMap = new Map()
        this.depositPairsMap = new Map()
    }
    addPoints = (points: bigint) => {
        this.Points += points
    }
    addv1PointsSnapshot = (points: bigint) => {
        this.v1PointsSnapshots.push(points);
    }

    addv2PointsSnapshot = (points: bigint) => {
        this.v2PointsSnapshots.push(points);
    }

    setPoints = (points: bigint) => {
        this.Points = points;
    }

    getPoints = () => {
        return this.Points;
    }

    addBorrowPair = (borrowpair: pairObject) => {
        if (!this.borrowPairsMap.has(borrowpair.pairAddress)) {
            this.borrowPairsMap.set(borrowpair.pairAddress, borrowpair);
            this.borrowPairs.push(borrowpair);
        }
    }

    addDepositPair = (depositpair: pairObject) => {
        if (!this.depositPairsMap.has(depositpair.pairAddress)) {
            this.depositPairsMap.set(depositpair.pairAddress, depositpair);
            this.depositPairs.push(depositpair);
        }
    }
    calculateFinalPoints = (epochs: bigint, version: string) => {
        if (version === 'v2') {
            this.v2PointsFinal = this.v2PointsSnapshots.reduce((a, c) => a + c, 0n) / epochs
        } else {
            this.v1PointsFinal = this.v1PointsSnapshots.reduce((a, c) => a + c, 0n) / epochs
        }
    }
}