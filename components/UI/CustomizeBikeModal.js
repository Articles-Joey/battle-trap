import dynamic from "next/dynamic";

import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import ArticlesButton from "./Button";
import ArticlesModal from "./ArticlesModal";

const Viewer = dynamic(() => import('@/components/Game/Viewer'), {
    ssr: false,
});

const RenderModel = dynamic(() => import('@/components/Game/RenderModel'), {
    ssr: false,
});

export default function CustomizeBikeModal() {

    const characters = useStore((state) => state.characters)
    const character = useStore(state => state.character);
    const setCharacter = useStore(state => state.setCharacter);

    const showEditBikeModal = useStore(state => state.showEditBikeModal);
    const setShowEditBikeModal = useStore(state => state.setShowEditBikeModal);

    const [autoRotate, setAutoRotate] = useState(true)

    return (
        <ArticlesModal
            show={showEditBikeModal}
            setShow={setShowEditBikeModal}
            title="Customize Bike"
        // scrollable
        >

            <div className="mb-3">
                <div className='ratio ratio-16x9 border bg-secondary'>
                    <div className='w-100 h-100'>

                        <ArticlesButton
                            active={autoRotate}
                            onClick={() => {
                                setAutoRotate(prev => !prev)
                            }}
                            className=""
                            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}
                        >
                            <i className="fad fa-sync me-0"></i>
                        </ArticlesButton>

                        <Viewer
                            autoRotate={autoRotate}
                        >

                            <RenderModel character={character} />

                        </Viewer>
                    </div>
                </div>
            </div>

            {/* <hr /> */}

            <div className="fw-bold mb-2">Bike Types</div>

            <div className=''>
                {characters.map(bike_obj => {
                    return (
                        <div key={bike_obj.name} className='d-flex align-items-start mb-3'>

                            <div
                                className="ratio ratio-16x9 bg-black me-2 flex-shrink-0 border"
                                style={{ width: '100px' }}
                            >
                                <div className="ratio ratio-16x9">
                                    <img src={`/img/characters/${bike_obj.name}.webp`} alt={`${bike_obj.name} thumbnail`}></img>
                                </div>
                                {/* <div className='d-flex justify-content-center align-items-center'>

                                </div> */}
                            </div>

                            <div>
                                <div className='fw-bold mb-0'>{bike_obj.name}</div>
                                <ArticlesButton
                                    small
                                    active={character.model == bike_obj.model}
                                    onClick={() => {
                                        setCharacter({
                                            ...character,
                                            model: bike_obj.model
                                        })
                                    }}
                                >
                                    Select
                                </ArticlesButton>
                                {/* <div className='small'>{bike_obj.description}</div> */}
                            </div>

                        </div>
                    )
                })}
            </div>

        </ArticlesModal>
    )
}