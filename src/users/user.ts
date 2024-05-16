import { pairObject } from "../pairs/pairObject.js"
export class User {
    public address: string
    private Points: bigint
    private v1PointsSnapshots: Array<bigint>
    private v2PointsSnapshots: Array<bigint>
    public borrowPairs: Array<pairObject>
    public depositPairs: Array<pairObject>
    constructor(address: string, points: bigint) {
        this.address = address
        this.Points = points
        this.borrowPairs = []
        this.depositPairs = []
        this.v1PointsSnapshots = []
        this.v2PointsSnapshots = []
    }
    addPoints(points: bigint) {
        this.Points += points
    }
    addv1PointsSnapshot(points: bigint) {
        this.v1PointsSnapshots.push(points)
    }
    addv2PointsSnapshot(points: bigint) {
        this.v2PointsSnapshots.push(points)
    }
    setPoints(points: bigint) {
        this.Points = points
    }
    getPoints() {
        return this.Points
    }
    addBorrowPair(borrowpair: pairObject) {
        this.borrowPairs.push(borrowpair)
    }
    addDepositPair(depositpair: pairObject) {
        this.depositPairs.push(depositpair);
    }
}