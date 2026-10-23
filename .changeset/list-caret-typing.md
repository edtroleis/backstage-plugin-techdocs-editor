---
'@edtroleis/plugin-techdocs-editor': patch
---

Typing right after creating a list item no longer scrambles the letters on a busy machine ("oisd"
instead of "dois"): the list item view of Milkdown restored a stale cursor position one animation
frame after mounting.
