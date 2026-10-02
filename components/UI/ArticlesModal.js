"use client";

import { useId, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
} from "@mui/material";
import ArticlesButton from "./Button";

export default function ArticlesModal({
    show,
    setShow,
    action,
    actionText,
    closeAction,
    closeText,
    title,
    children,
    backdrop,
    disableClose,
    disableAction,
    className,
    modalClassName,
    centered,
    scrollable,
    size,
    actionVariant,
    footerOverride,
    contentSx,
}) {
    const [showModal, setShowModal] = useState(true);
    const titleId = useId();

    return (
        <Dialog
            className={`articles-modal ${modalClassName || ""}`}
            maxWidth={size || "md"}
            fullWidth
            open={show !== false && showModal}
            aria-labelledby={titleId}
            scroll={scrollable === false ? "body" : "paper"}
            hideBackdrop={backdrop === false}
            disableEscapeKeyDown={disableClose}
            onTransitionExited={() => {
                setShow(false);
            }}
            onClose={(_, reason) => {
                if (
                    disableClose ||
                    (backdrop === "static" && reason === "backdropClick")
                ) {
                    return;
                }
                setShowModal(false);
            }}
            slotProps={{
                paper:
                    centered === false
                        ? {
                              sx: {
                                  alignSelf: "flex-start",
                                  marginTop: 4,
                              },
                          }
                        : undefined,
            }}
        >
            <DialogTitle
                id={titleId}
                sx={{ paddingRight: disableClose ? 3 : 7 }}
            >
                {title || "Info"}
                {!disableClose && (
                    <IconButton
                        aria-label="Close dialog"
                        onClick={() => {
                            setShowModal(false);
                        }}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent
                className={className}
                sx={contentSx}
            >
                {children || "..."}
            </DialogContent>

            <DialogActions sx={{ justifyContent: "space-between" }}>
                {footerOverride ? (
                    footerOverride(setShowModal)
                ) : (
                    <>
                        {!action && <Box />}

                        <Box>
                            {(!disableClose || closeAction) && (
                                <ArticlesButton
                                    variant="outline-dark"
                                    onClick={() => {
                                        if (closeAction) {
                                            closeAction();
                                        } else {
                                            setShowModal(false);
                                        }
                                    }}
                                >
                                    {closeText || "Close"}
                                </ArticlesButton>
                            )}
                        </Box>

                        {action && (
                            <ArticlesButton
                                variant={actionVariant || "articles"}
                                disabled={disableAction}
                                onClick={() => {
                                    console.log("action");
                                    action(setShowModal);
                                }}
                            >
                                {actionText || "Continue"}
                            </ArticlesButton>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
