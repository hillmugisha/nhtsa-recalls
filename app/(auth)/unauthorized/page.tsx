import Image from 'next/image'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#eef0f5' }}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm px-8 py-10 flex flex-col items-center gap-6 text-center">
        <Image src="/logo.png" alt="Pritchard Commercial" width={72} height={72} className="object-contain" />
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Access Pending</h1>
          <p className="text-sm text-gray-500">
            Your account has been created but access has not been granted yet.
            Please contact your administrator to enable your account.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium underline text-gray-500 hover:text-gray-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
