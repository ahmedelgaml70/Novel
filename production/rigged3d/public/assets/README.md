# Local ready assets

Do not commit downloaded vendor packs here until repository binary/LFS policy is decided.

One-time inputs from the official free Quaternius Standard packs:

- Universal Base Characters: `Base Characters/Godot - UE/Superhero_Male_FullBody.gltf` plus its `.bin` and referenced textures.
- Universal Animation Library: `Unreal-Godot/UAL1_Standard.glb`.
- Universal Animation Library 2: `Unreal-Godot/UAL2_Standard.glb`.

Use non-root-motion Standard animation files for the proof.

After copying the inputs into a temporary local workspace, run from `production/rigged3d`:

`npm install`

`npm run merge:quaternius -- /path/Superhero_Male_FullBody.gltf public/assets/human_male.glb /path/UAL1_Standard.glb /path/UAL2_Standard.glb`

Then:

`npm run list:clips`

The director resolves semantic actions against the actual clip names instead of hardcoding a clip that may change between pack versions.

If NodeIO reports missing `_png.png` textures, the Quaternius glTF archive may contain a known filename-reference mismatch. Resolve the missing referenced filename from the corresponding non-`_png` texture before merging; do not edit geometry or rigging.
