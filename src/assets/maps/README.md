# Local globe assets

All map assets are served from this site's build output. No external map or tile
service is used at runtime.

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
