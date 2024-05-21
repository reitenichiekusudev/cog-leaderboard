export class pairObject {
    public pairAddress: string
    public userAddress: string
    public Token: string
    public tokenSnapshotBalance: bigint
    private points: bigint
    public userPointsSetter: Function
    constructor(address: string, points: bigint, userPointsSetter: Function, Token: string, userAddress: string) {
        this.pairAddress = address
        this.points = points
        this.userPointsSetter = userPointsSetter
        this.Token = Token
        this.tokenSnapshotBalance = 0n
        this.userAddress = userAddress
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