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

Retrieved 2026-10-14. Natural Earth vector data are public domain:
https://www.naturalearthdata.com/about/terms-of-use/

The optional terrain layer and its raster assets were removed on 2026-10-15
following visual review. Only the continuous vector basemap is shipped.
