import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button";

export default function MenuBar() {

    const showMenu = useStore(state => state.showMenu);
    const toggleShowMenu = useStore(state => state.toggleShowMenu);

    return (
        <div className="menu-bar card rounded-0 card-articles p-1 justify-content-center">

            <div className='flex-header align-items-center'>

                <ArticlesButton
                    small
                    active={showMenu}
                    onClick={() => {
                        toggleShowMenu()
                    }}
                >
                    <i className="fad fa-bars"></i>
                    <span>Menu</span>
                </ArticlesButton>

                <div>
                    {/* Y: {(playerLocation?.y || 0)} */}
                </div>

            </div>

        </div>
    )

}