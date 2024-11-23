import { Dialog as DialogPrimitive } from "bits-ui";

const Root = DialogPrimitive.Root;
const Trigger = DialogPrimitive.Trigger;

import Overlay from "./dialog-overlay.svelte";
import Portal from "./dialog-portal.svelte";
import Content from "./dialog-content.svelte";
import Header from "./dialog-header.svelte";

export {
    Root,
    Trigger,
    Overlay,
    Portal,
    Content,
    Header,
    //
    Root as DialogRoot,
    Trigger as DialogTrigger,
    Overlay as DialogOverlay,
    Portal as DialogPortal,
    Content as DialogContent,
}