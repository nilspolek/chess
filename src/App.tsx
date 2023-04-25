import ChessBoard from "./chessBoard/ChessBoard.tsx";


export default function App() {
    return (
        <div className="grid place-items-center">
            <div className="w-full lg:w-8/12 md:w-10/12">
                <ChessBoard></ChessBoard>
            </div>
        </div>
    )
}