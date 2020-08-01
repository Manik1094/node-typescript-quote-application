export  type JwtPayload = {
    header: {
        alg: string,
        type: string
    },
    payload: {
        userId: string,
        email: string,
        iat: number,
        exp: number
    },
    signature: string
}
