import { NextResponse } from 'next/server'
import { getAuth } from 'firebase/auth'
import { admin } from '../firebase'

export async function middleware(request) {
    const auth = getAuth(admin)
    const user = auth.currentUser
    const adminEmail = process.env.NEXT_PUBLIC_EMAIL

    if (!user || user.email !== adminEmail) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
