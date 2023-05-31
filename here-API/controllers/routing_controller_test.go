package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"here-API/mocks"
	"here-API/models"
	"io"
	"net/http"
	"testing"
)

func TestGetRouting(t *testing.T) {
	testCase := struct {
		name string
		api  func(t *testing.T) *mocks.MockHereAPI
	}{
		name: "Geocoding - valid json",
		api: func(t *testing.T) *mocks.MockHereAPI {
			a := mocks.NewMockHereAPI(t)
			content := `{"routes":[{"id":"0f2310cf-1076-471a-a703-6323d96ea12a","sections":[{"id":"5bc2bc9c-d781-456c-81a3-50a168735e95","type":"vehicle","departure":{"time":"2021-11-01T10:00:00+01:00","place":{"type":"place","location":{"lat":51.0193731,"lng":17.1613281},"originalLocation":{"lat":51.019519,"lng":17.1615459}}},"arrival":{"time":"2021-11-01T10:23:27+01:00","place":{"type":"place","location":{"lat":51.1086687,"lng":17.0387871},"originalLocation":{"lat":51.1086709,"lng":17.0388039}}},"summary":{"duration":1407,"length":13354,"baseDuration":1407},"polyline":"BG6m_phDgnu3gBif3zBgKvR0K3S4NjXwHvM0FrJoGzK8G7LsJ_O0KvR8Q3c0FrJ0jBj6BsYnpBwR3c8a_sBsJzPoVzjBgUvgBgFjIsE7GoGzKwHjNgKjS0F_J8G7LsJnQ8Q3coG_JoQ7a4N7VwMzUwMnVkN7Vs7B_jDoQ7akI3NkIrO0KjSwHvMsEvHgFjIwHjNkN7VoG_JsEvHoGzK8GzKoG_J0F3I0F3IsEnGsEnGsEnGsEzFoGjIwMnQsEnGgF7GoGjIkIzKoLrO0FjI0FjI4I3NoG_J8GnLoLvRoG_J0F3IoGrJsJvMwRvWozB79B0PrTsJnL0tBn4BsOjSkNzP4SvWoVnawWvb8kB_sBkNzP8VnasE_EgPjSkI_J4IzK8G3I8GrJ8G_JgFvHgFjIgFjI4IrO0KvRkI3N0KvRkNvWsY_nBwM7VwHjI4DrEgFnGkIzKwH_J4D_E4D3DkDvCkDAkDAwCnB8BnBoBnB8B7BwC3D8BjDUjDUjDU_EAjDTzF8BnG8B_EwCzFwHrOgFzKsErJsEnL4DzK4DnGoG_J4DnGwWvlB0FrJkN7V8L_TgFjI8G7LsJzPsEvHsEvHoajrB08B7lDsEvHsJzPsEvHoiC7vDwHvM4X_nBsO_YoQnaoLrTsEvH4IrOkcvvBwR3c4IrOsTjhBoGzKwWjmBkIrO4IrOgK7Q0FrJ0FrJoGzKwHvM4DnGoV3hBoGrJ0FjIoG3I0FvH8G3IsY_d8G3IwHrJwHrJ8QnV0KjNoGvH8G3I0F7GsJnLsOvRgKvM4IzKoGvHoGvHwHrJ8LrO8GjIoGvHwH3IoGvH4DrE4DrE0FnG0FnGoGnGgFzFsJzK4IrJgKzKgKzKoL7LwHvH4IrJwHjI0KnLsJ_JsJrJoL7LgK_J8GvHgF_EgF_E8GvHkI3IgK_JkN3N4IrJwMvM4IrJsE_EgKzK8LvMwMjN4S3S4IrJ8GvH4IrJsJrJ8LvMkSrTgK_JoGnG8GvH0FzFwHjI0UnVgenfsJ_JoG7G0FzFgF_E0FnG0KnL4IrJ8G7GwHvHgZna8G7GoG7GoG7GwHjI4I3I4wBzyBwbjcgevgBgUzU8LvMsnBnpB0P7QoQ7QgP_O4uC3zCssBztBofjhBsYzZ8L7LoL7L0KnLoL7LsJ_J4IrJwHvHkhBriBkS3S8VjX0KnL4IrJ8G7G4I3IkI3I4IrJ8QvRwgBriB4I3IwW3X8VjXgK_JoL7LwMjNsJ_J8LvM8LvMwMvMsOrO4NvMkN7L0P3N4XnV0FzFgF_EsE_EgFnGgF7GwjCz6CoV3ckInLsJvM0Uvb8ankBsJ7L4I_J4IzKwH_J4I7LsJjN4N3S8QvW4I7LwHnL4IjNgKzPgerxBoLjSgK7QwHjNsEjIoGzK8LrT8V7kBsEvHgF3I4I_OgK7QgKnQ8Q7akN7VgPzZgPrY4DnGsEvHgFjIsEvHsEvH4DvHgF7L4InVsE_JgFrJwHjNoG_JwHzK8LnQ8GrJkDjDwCvCwCjDwCjDgK_OsEnG0ZnkB0KzPoQrYoajmBwWzewWnfsE7GkDrEgUrd8V7fwRrdgK7Q0KzPgKrOwHzK4I7LoGjI8GrJ4InLwH_JwHzK8LjS4X_iBkInLoG3I8G_JoQjXgFjI4D7G4DvHsE_JgF7GsEzFsJvMoG3IgPnVoLnQ4DzFsEnGkN3SkNjS0Z7kB4IjNwHnL4DzFsOzUsJjNsEnGgFvH8GrJ4I7L4IvMsEnGoG3IgU3cgF7GkI7LkI7LwHzKgF7GgFnG4DrEsE_EgF_E0F_EoG_E8G_EoLjI4NzKwM_JkIvH4DjD4DvC4D7B0F7BsJ7B8LvCgPjD0K7B0P3DkI7B8G7BwHvC0FvC0FjD8GrEoG_EoGzFoG7G8GjI8VzZkI3IwHvHgF_E0FzFkIjI8V7V0FzF4D3DwMvMkIjI0FzF8anawbjcsOzPsE_EoL3NoL3NoL_OkInL0U3coG3IwHzKoG3IwR_YkInLkIzK8L_OkNzP4IzKgK7LwHjI4DrEkIT0FAsEAgFAoGUoGvHoG7GkD_EwH_OoGjNwHnQ8LrY0U7uB0PnkBwHvRgK3XkI_T8G3IoGjN4I3XsE_OkDjSwHjrBkIr2BwCrOsEzjBoBvMgF_O8BvH8B3I4D3X4Dna4DjhBkD3I8B_EwCrEkDjDgFjDkITsEnBsEnBoGvCsE7BuCZ","transport":{"mode":"truck"}}]}]}`
			responseBody := io.NopCloser(bytes.NewReader([]byte(content)))

			a.EXPECT().Route().Return(
				&http.Response{
					Body: responseBody,
				}, nil)
			return a
		},
	}
	t.Run(testCase.name, func(t *testing.T) {
		api := testCase.api(t)
		response, _ := api.Route()
		respBody, _ := io.ReadAll(response.Body)
		type Data struct {
			Items []models.Route `json:"routes"`
		}

		var data Data
		err := json.Unmarshal(respBody, &data)
		if err != nil {
			log.Fatal().Msg(fmt.Sprintf("%v", err))
		}

		if len(data.Items) > 0 {
			section1 := data.Items[0]
			fmt.Println(section1)
		} else {
			fmt.Println("No items found in the JSON data")
		}

		assert.Equal(t, 1, len(data.Items))
	})
}
