export default function Sidebar ({ pageName }: { pageName: string}) {
    return (
        <div className="border-r-2 border-green-700 w-48 overflow-scroll px-2 pt-2">
            <p className="border-b-2 border-green-700">{pageName}</p>
            <div className="text-sm font-medium leading-6 text-gray-900 border-b-2 border-green-700 py-2">
                <label htmlFor="version" className="inline-block text-sm font-medium leading-6 text-gray-900">Version</label>
                <select name="version" id="version" className="inline-block rounded-md border-0 ring-1 ring-inset ring-gray-300">
                    <option>Latest</option>
                    <option>v6</option>
                    <option>v5</option>
                </select>
            </div>
        </div>
    )
}