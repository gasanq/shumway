#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "alpha.h"
#include "blur.h"

void blur(unsigned char *img, int width, int height, int distX, int distY, int quality)
{
	preMultiplyAlpha(img, width, height);

	for (int i = 0; i < quality; ++i) {
		blurX(img, width, height, distX);
		blurY(img, width, height, distY);
	}

	preMultiplyAlphaUndo(img, width, height);
}

void blurX(unsigned char *img, int width, int height, int distance)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int dist2 = distance << 1;
	int dist4 = dist2 << 1;
	int lineSize = width << 2;
	int windowLength = dist2 + 1;
	int windowSize = windowLength << 2;

	unsigned char *lineBuffer = malloc(lineSize);

	for (int y = 0; y < height; ++y)
	{
		long rs = 0, gs = 0, bs = 0, as = 0;

		// Fill window
		unsigned char *ptr = src;
		unsigned char *ptrEnd = src + windowSize;
		while (ptr < ptrEnd) {
			rs += *ptr;
			gs += *(ptr + 1);
			bs += *(ptr + 2);
			as += *(ptr + 3);
			ptr += 4;
		}

		// Slide window
		ptr = src + dist4;
		ptrEnd = ptr + ((width - dist2) << 2);
		unsigned char *pLine = lineBuffer + dist4;
		unsigned char *pLast = src;
		unsigned char *pNext = ptr + ((distance + 1) << 2);
		while (ptr < ptrEnd) {
			*pLine = (rs / windowLength) & 0xff;
			*(pLine + 1) = (gs / windowLength) & 0xff;
			*(pLine + 2) = (bs / windowLength) & 0xff;
			*(pLine + 3) = (as / windowLength) & 0xff;

			rs += *pNext - *pLast;
			gs += *(pNext + 1) - *(pLast + 1);
			bs += *(pNext + 2) - *(pLast + 2);
			as += *(pNext + 3) - *(pLast + 3);

			ptr += 4;
			pLine += 4;
			pNext += 4;
			pLast += 4;
		}

		// Copy line
		memcpy(src, lineBuffer, lineSize);

		src += lineSize;
	}

	free(lineBuffer);
}

void blurY(unsigned char *img, int width, int height, int distance)
{
	if (distance < 1) {
		return;
	}

	unsigned char *src = img;

	int stride = width << 2;
	int windowLength = (distance << 1) + 1;

	unsigned char *columnBuffer = malloc(height << 2);

	for (int x = 0; x < width; ++x)
	{
		long rs = 0, gs = 0, bs = 0, as = 0;

		// Fill window
		unsigned char *ptr = src;
		unsigned char *ptrEnd = src + windowLength * stride;
		while (ptr < ptrEnd) {
			rs += *ptr;
			gs += *(ptr + 1);
			bs += *(ptr + 2);
			as += *(ptr + 3);
			ptr += stride;
		}

		// Slide window
		ptr = src + distance * stride;
		ptrEnd = ptr + (height - distance) * stride;
		unsigned char *pColumn = columnBuffer + (distance << 2);
		unsigned char *pLast = src;
		unsigned char *pNext = ptr + (distance + 1) * stride;
		while (ptr < ptrEnd) {
			*pColumn = (rs / windowLength) & 0xff;
			*(pColumn + 1) = (gs / windowLength) & 0xff;
			*(pColumn + 2) = (bs / windowLength) & 0xff;
			*(pColumn + 3) = (as / windowLength) & 0xff;

			rs += *pNext - *pLast;
			gs += *(pNext + 1) - *(pLast + 1);
			bs += *(pNext + 2) - *(pLast + 2);
			as += *(pNext + 3) - *(pLast + 3);

			ptr += stride;
			pColumn += 4;
			pNext += stride;
			pLast += stride;
		}

		// Copy column
		unsigned int *ptr32 = (unsigned int *)src;
		unsigned int *ptr32End = ptr32 + height * width;
		unsigned int *columnBuffer32 = (unsigned int *)columnBuffer;
		while (ptr32 < ptr32End) {
			*ptr32 = *columnBuffer32;
			ptr32 += width;
			columnBuffer32++;
		}

		src += 4;
	}

	free(columnBuffer);
}
