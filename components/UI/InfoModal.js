import { useEffect, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import ViewUserModal from "@/components/UI/ViewUserModal"

// import BasicLoading from "@/components/loading/BasicLoading";

// import powerups from "app/(site)/community/games/four-frogs/components/powerups";

// import games from "../constants/games";
const games = []

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";
import Link from "next/link";

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    // const userReduxState = useSelector((state) => state.auth.user_details);
    const userReduxState = false

    const [showVideo, setShowVideo] = useState()

    useEffect(() => {

        if (!show.item) {
            setShow({
                ...show,
                item: games.find(game_obj => game_obj.name == show.game)
            })
        }

    }, [])

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className="p-3">

                        <div className="fw-bold mb-2">
                            {show.game || 'No game property provided'}
                        </div>

                        <div className="">
                            {show?.item?.short_description}
                        </div>

                    </div>

                    <hr />

                    {show?.item?.welcome &&
                        <div className="p-3 py-2 border-bottom">

                            <b>Welcome to {show?.item?.name}</b>
                            <p className='small mb-2'>
                                {show?.item?.welcome?.preview_text}
                            </p>

                            <div className="ratio ratio-16x9">
                                <img src={show?.item?.welcome?.preview_gif} alt="" />
                            </div>

                        </div>
                    }

                    <hr />

                    <div className="p-3 py-1">

                        <div className="mb-3">
                            <b>Credits</b>
                        </div>

                        <Link
                            href="https://github.com/ArticlesJoey"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="d-flex align-items-center mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div>
                                    <div className="fw-bold">ArticlesJoey</div>
                                    <div className="">Developer</div>
                                </div>

                            </div>
                        </Link>

                        <Link
                            href="https://github.com/ArticlesJoey"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="d-flex align-items-center mb-3">

                                <div className="me-3">
                                    <i className="fad fa-link fa-2x me-0"></i>
                                </div>

                                <div className="">
                                    <div className="fw-bold">Articles Media</div>
                                    <div className="">Publisher</div>
                                </div>

                            </div>
                        </Link>

                        <div className="mb-3">
                            <b>Attributions</b>
                        </div>

                        <div className="d-flex align-items-center mb-3">

                            <Link
                                href="https://github.com/Articles-Joey/battle-trap/blob/main/README.md"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ArticlesButton
                                    className=""
                                >
                                    <i className="fab fa-github"></i>
                                    View on Github
                                </ArticlesButton>
                            </Link>

                        </div>

                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}