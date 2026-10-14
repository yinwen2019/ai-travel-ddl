# Local globe assets

Runtime map assets are served from this site's build output. No external map or
tile service is used at runtime. The GeoJSON below is authoring input only.

## Prepared mesh

- File: `world-mesh.bin.gz` (673,444 bytes)
- Rebuild: `npm run map:prepare` after editing the source GeoJSON.
- Generator: `tools/build-globe-mesh.mjs`, separate from the AI data pipeline.
- Format: CLG1 version 2, a 24-byte little-endian count header followed by
  zigzag/delta varints and gzip compression. Quantized normalized Int16 positions
  are shared by Uint32 triangle and border indices.
- Geometry: 90,378 shared vertices; 118,765 land triangles. Land is a single mesh,
  borders are a single indexed line object, and neither participates in hit tests.
- Coordinates and the 1-degree spherical tessellation are prepared offline;
  browsers do not fetch or triangulate the source GeoJSON. Decoded arrays are
  reused across route visits; each mounted scene owns and releases its GPU buffers.
- Modern browsers use streaming gzip decompression; a lazy Three.js fflate fallback
  supports browsers without DecompressionStream. Automatically decompressed server
  responses are detected to avoid decoding twice.

## Vector countries

- File: `world-land.geojson`
- Source: Natural Earth, 1:50m Admin 0 countries, maintained by Nathaniel Vaughn Kelso
- Original: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
- Processing: retain polygon geometry only; round coordinates to five decimal places;
  remove descriptive properties. No conference data is included.
- The scale is 1:50,000,000, not 50-meter positional accuracy.

## Terrain

- Files: `natural-earth-terrain.webp`, `natural-earth-terrain-mobile.webp`
- Source: Natural Earth II with Shaded Relief and Water, version 3.2.0
- Overview: https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/
- Original: https://naturalearth.s3.amazonaws.com/50m_raster/NE2_50M_SR_W.zip
- Processing: convert the 10800 × 5400 RGB raster to 4096 × 2048 WebP (quality 86)
  and 2048 × 1024 WebP (quality 82), using Lanczos resampling. Preserve colors,
  geographic alignment, and the full equirectangular extent.
- Load only on first terrain selection; choose the smaller file for mobile.

Retrieved 2026-10-14. Natural Earth vector and raster data are public domain:
https://www.naturalearthdata.com/about/terms-of-use/
