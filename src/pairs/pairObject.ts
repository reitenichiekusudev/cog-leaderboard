export class pairObject {
    public pairAddress: string
    public depositToken: string
    private points: bigint
    private userPointsSetter: Function
    constructor(address: string, points: bigint, userPointsSetter: Function, depositToken: string) {
        this.pairAddress = address
        this.points = points
        this.userPointsSetter = userPointsSetter
        this.depositToken = depositToken
    }
    addPoints(points: bigint) {
        this.points += points
    }
    setPoints(points: bigint) {
        this.points = points
    }
    getPoints() {
        return this.points
    }
}