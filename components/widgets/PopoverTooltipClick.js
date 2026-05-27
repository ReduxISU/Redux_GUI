import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

function popOver(props) {
  const t = props?.toolTip || {};

  return (
    <Popover id="popover-basic" className="tooltip">
      {t.header && (
        <Popover.Header as="h3" style={{ fontWeight: 700 }}>
          {t.header}
        </Popover.Header>
      )}

      <Popover.Body style={{ maxWidth: 480, lineHeight: 1.35 }}>
        {t.formalDef && t.isMathDef ? (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              background: "rgba(0,0,0,0.06)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              whiteSpace: "pre-wrap",
              marginBottom: 12
            }}
          >
            {t.formalDef}
          </div>
        ) : t.formalDef ? (
          <div style={{ marginBottom: 12 }}>{t.formalDef}</div>
        ) : null}

        {t.info ? (
          <div style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>
            <strong>Definition:</strong> {t.info}
            {t.componentLink && (
              <a
                href={t.componentLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                <OpenInNewIcon fontSize="small" />
              </a>
            )}
          </div>
        ) : null}

        {t.source ? (
          <div style={{ marginBottom: 6 }}>
            <strong>Source:</strong> {t.source}
            {t.sourceLink && (
              <a
                href={t.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                <OpenInNewIcon fontSize="small" />
              </a>
            )}
          </div>
        ) : null}

        {t.credit ? (
          <div>
            <strong>Contributed by:</strong> {t.credit}
          </div>
        ) : null}
      </Popover.Body>
    </Popover>
  );
}

function PopoverTooltipClick(props) {
  return (
    <OverlayTrigger
      rootClose={true}
      trigger="click"
      placement="bottom"
      overlay={popOver(props)}
    >
      <InfoOutlinedIcon style={{ cursor: "pointer" }} />
    </OverlayTrigger>
  );
}

export default PopoverTooltipClick;
