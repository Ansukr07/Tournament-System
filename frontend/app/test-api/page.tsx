"use client"

import { useState } from "react"

export default function TestPage() {
    const [result, setResult] = useState<any>(null)

    const testAPI = async () => {
        const response = await fetch("http://localhost:5000/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Browser Test", clubName: "Browser Club" }),
            credentials: "include",
            mode: "cors",
        })
        const data = await response.json()
        setResult(data)
        alert(`API returned:\nName: ${data.name}\nID: ${data.uniqueId}\nClub: ${data.clubName}`)
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
            <button
                onClick={testAPI}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Test API
            </button>
            {result && (
                <div className="mt-4 p-4 border rounded">
                    <h2 className="font-bold">API Response:</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
