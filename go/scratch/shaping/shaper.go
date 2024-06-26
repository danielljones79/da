package shaping

import (
	"fmt"

	"github.com/benoitkugler/textlayout/fonts"
	"github.com/benoitkugler/textlayout/harfbuzz"
	"github.com/go-text/di"
	"golang.org/x/image/math/fixed"
)

type Shaper interface {
	// Shape takes an Input and shapes it into the Output.
	Shape(Input) Output
}

// MissingGlyphError indicates that the font used in shaping did not
// have a glyph needed to complete the shaping.
type MissingGlyphError struct {
	fonts.GID
}

func (m MissingGlyphError) Error() string {
	return fmt.Sprintf("missing glyph with id %d", m.GID)
}

// InvalidRunError represents an invalid run of text, either because
// the end is before the start or because start or end is greater
// than the length.
type InvalidRunError struct {
	RunStart, RunEnd, TextLength int
}

func (i InvalidRunError) Error() string {
	return fmt.Sprintf("run from %d to %d is not valid for text len %d", i.RunStart, i.RunEnd, i.TextLength)
}

const (
	// scaleShift is the power of 2 with which to automatically scale
	// up the input coordinate space of the shaper. This factor will
	// be removed prior to returning dimensions. This ensures that the
	// returned glyph dimensions take advantage of all of the precision
	// that a fixed.Int26_6 can provide.
	scaleShift = 6
)

// Shape turns an input into an output.
func Shape(input Input) (Output, error) {
	// Prepare to shape the text.
	// TODO: maybe reuse these buffers for performance?
	buf := harfbuzz.NewBuffer()
	runes, start, end := input.Text, input.RunStart, input.RunEnd
	if end < start {
		return Output{}, InvalidRunError{RunStart: start, RunEnd: end, TextLength: len(input.Text)}
	}
	buf.AddRunes(runes, start, end-start)
	// TODO: handle vertical text?
	switch input.Direction {
	case di.DirectionLTR:
		buf.Props.Direction = harfbuzz.LeftToRight
	case di.DirectionRTL:
		buf.Props.Direction = harfbuzz.RightToLeft
	default:
		return Output{}, UnimplementedDirectionError{
			Direction: input.Direction,
		}
	}
	buf.Props.Language = input.Language
	buf.Props.Script = input.Script
	// TODO: figure out what (if anything) to do if this type assertion fails.
	font := harfbuzz.NewFont(input.Face.(harfbuzz.Face))
	font.XScale = int32(input.Size.Ceil()) << scaleShift
	font.YScale = font.XScale

	// Actually use harfbuzz to shape the text.
	buf.Shape(font, nil)

	// Convert the shaped text into an Output.
	glyphs := make([]Glyph, len(buf.Info))
	for i := range glyphs {
		g := buf.Info[i].Glyph
		extents, ok := font.GlyphExtents(g)
		if !ok {
			// TODO: can this error happen? Will harfbuzz return a
			// GID for a glyph that isn't in the font?
			return Output{}, MissingGlyphError{GID: g}
		}
		glyphs[i] = Glyph{
			Width:    fixed.I(int(extents.Width)) >> scaleShift,
			Height:   fixed.I(int(extents.Height)) >> scaleShift,
			XBearing: fixed.I(int(extents.XBearing)) >> scaleShift,
			YBearing: fixed.I(int(extents.YBearing)) >> scaleShift,
			XAdvance: fixed.I(int(buf.Pos[i].XAdvance)) >> scaleShift,
			YAdvance: fixed.I(int(buf.Pos[i].YAdvance)) >> scaleShift,
			XOffset:  fixed.I(int(buf.Pos[i].XOffset)) >> scaleShift,
			YOffset:  fixed.I(int(buf.Pos[i].YOffset)) >> scaleShift,
			Cluster:  buf.Info[i].Cluster,
			Glyph:    g,
			Mask:     buf.Info[i].Mask,
		}
	}
	out := Output{
		Glyphs: glyphs,
	}
	fontExtents := font.ExtentsForDirection(buf.Props.Direction)
	out.LineBounds = Bounds{
		Ascent:  fixed.I(int(fontExtents.Ascender)) >> scaleShift,
		Descent: fixed.I(int(fontExtents.Descender)) >> scaleShift,
		Gap:     fixed.I(int(fontExtents.LineGap)) >> scaleShift,
	}
	return out, out.RecalculateAll(input.Direction)
}
