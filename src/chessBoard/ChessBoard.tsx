import {Chessboard} from "react-chessboard";
import {Chess} from "chess.js";
import { useEffect, useState} from "react";
import useWebSocket from "react-use-websocket";
export default function ChessBoard() {
    const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:5000/echo")

    const [game, setGame] = useState(new Chess())
    const [f, forceRender] = useState(0)
    const ownColour = 'w'
    useEffect(evaluate, [])
    const [evalMode, setEvalMode] = useState(false)
    const [originalHistory, setOriginalHistory] = useState([...game.history()])


    function onDrop(sourceSquare: string, targetSquare: string) {
        const move = makeAMove({from: sourceSquare, to: targetSquare});
        // illegal move
        return move !== null;
    }
    function makeAMove(move: string | { from: string, to: string, promotion?: string }) {
        if (ownColour != getCurrentColor() && !evalMode) {
            console.log("Not your Color")
            return false
        }
        sendMessage(game.fen())
        const gameCopy = game
        const result = gameCopy.move(move);
        forceRender(f + 1)
        setGame(gameCopy);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log(game.ascii())
        return result;
    }

    function getCurrentColor() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (game.history().length == 0) return "w"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return (game.history({verbose: true}).at(-1).color == "w" ? "s" : "w")
    }

    function evaluate() {
        setEvalMode(true)
        const pgn = "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O"
        game.loadPgn(pgn)
        setOriginalHistory(game.history().slice())
        forceRender(f + 1)
    }

    function handle(i: number) {
        game.reset()
        forceRender(f + 1)
        originalHistory.slice(0, i).map(e => game.move(e))
    }


    function compute() {
        if(lastMessage===null)return 50
        return Number(lastMessage.data)+50
    }


    return (
        <div>
            <div className="card bg-base-200 p-10 grid grid-cols-3">
                <div className="col-span-2">
                    <Chessboard position={game.fen()} onPieceDrop={onDrop} arePremovesAllowed={!evalMode}
                                boardOrientation={(ownColour == "w" ? "white" : "black")}/>
                </div>
                <div className="grid grid-cols-2 overflow-y-auto h-2/3">
                    {
                        originalHistory.map((e, i) => {
                            return <a className="link ml-2"
                                      onClick={() => handle(i + 1)}>{(i + 1) + "." + e + ","}</a>
                        })
                    }
                </div>
                <progress className="progress h-full w-full col-span-3 lg:mt-4 bg-white" value={(compute()/1,5)}
                          max="100"></progress>
            </div>
        </div>
    )
}