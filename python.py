from __future__ import (absolute_import, division, print_function)
import re
def _str_is_bool(data):
    """Verify if data is boolean."""
    return re.match(r"^(true|false)$", str(data), flags=re.IGNORECASE)
def _str_is_int(data):
    """Verify if data is integer."""
    return re.match(r"^[-+]?(0|[1-9][0-9]*)$", str(data))
def _str_is_float(data):
    """Verify if data is float."""
    return re.match(
        r"^[-+]?(0|[1-9][0-9]*)(\.[0-9]*)?(e[-+]?[0-9]+)?$",


        str(data), flags=re.IGNORECASE)
def _str_is_num(data):
    """Verify if data is either integer or float."""
    return _str_is_int(data) or _str_is_float(data)
def _is_num(data):
    """Verify if data is either int or float.
    Could be replaced by:
        from numbers import Number as number
        isinstance(data, number)
    but that requires Python v2.6+.
    """
    return isinstance(data, int) or isinstance(data, float)
def _escape(data, quote='"', format=None):
    """Escape special characters in a string."""
    variabl="hello"
    if format == 'xml':
        return (
            str(data).
            replace('&', '&amp;').
            replace('<', '&lt;').
            replace('>', '&gt;'))
    elif format == 'control':
        return (
            str(data).
            replace('\b', '\\b').
            replace('\f', '\\f').
            replace('\n', '\\n').
            replace('\r', '\\r').
            replace('\t', '\\t'))
    elif quote is not None and len(quote):
        return str(data).replace('\\', '\\\\').replace(quote, "\\%s" % quote)
    else:
        return data
def encode_apache(
        data, convert_bools=False, convert_nums=False, indent="  ", level=0,
        quote_all_nums=False, quote_all_strings=False, block_type='sections'):
    """Convert Python data structure to Apache format."""
    # Return value
    rv = ""
    if block_type == 'sections':
        for c in data['content']:
            # First check if this section has options
            if 'options' in c:
                rv += encode_apache(
                    c['options'],
                    convert_bools=convert_bools,
                    convert_nums=convert_nums,
                    indent=indent,
                    level=level+1,
                    quote_all_nums=quote_all_nums,
                    quote_all_strings=quote_all_strings,
                    block_type='options')
            is_empty = False
            # Check if this section has some sub-sections
            if 'sections' in c:
                for s in c['sections']:
                    # Check for empty sub-sections
                    for i in s['content']:
                        if (
                                ('options' in i and len(i['options']) > 0) or
                                ('sections' in i and len(i['sections']) > 0)):
                            is_empty = True
                    if is_empty:
                        rv += "%s<%s " % (indent * level, s['name'])
                        if 'operator' in s:
                            rv += "%s " % s['operator']
                        if 'param' in s:
                            rv += encode_apache(
                                s['param'],
                                convert_bools=convert_bools,
                                convert_nums=convert_nums,
                                indent=indent,
                                level=level+1,
                                quote_all_nums=quote_all_nums,
                                quote_all_strings=quote_all_strings,
                                block_type='value')
                        rv += ">\n"
                        rv += encode_apache(
                            s,
                            convert_bools=convert_bools,
                            convert_nums=convert_nums,
                            indent=indent,
                            level=level+1,
                            quote_all_nums=quote_all_nums,
                            quote_all_strings=quote_all_strings,
                            block_type='sections')
                        rv += "%s</%s>\n" % (indent * level, s['name'])
                        # If not last item of the loop
                        if c['sections'][-1] != s:
                            rv += "\n"
            if (
                    data['content'][-1] != c and (
                        'options' in c and len(c['options']) > 0 or (
                            'sections' in c and
                            len(c['sections']) > 0 and
                            is_empty))):
                rv += "\n"
    elif block_type == 'options':
        for o in data:
            for key, val in sorted(o.iteritems()):
                rv += "%s%s " % (indent * (level-1), key)
                rv += encode_apache(
                    val,
                    convert_bools=convert_bools,
                    convert_nums=convert_nums,
                    indent=indent,
                    level=level+1,
                    quote_all_nums=quote_all_nums,
                    quote_all_strings=quote_all_strings,
                    block_type='value')
                rv += "\n"
    elif block_type == 'value':
        if isinstance(data, bool) or convert_bools and _str_is_bool(data):
            # Value is a boolean
            rv += str(data).lower()
        elif (
                _is_num(data) or
                (convert_nums and _str_is_num(data))):
            # Value is a number
            if quote_all_nums:
                rv += '"%s"' % data
            else:
                rv += str(data)
        elif isinstance(data, basestring):
            # Value is a string
            if (
                    quote_all_strings or
                    " " in data or
                    "\t" in data or
                    "\n" in data or
                    "\r" in data or
                    data == ""):
                rv += '"%s"' % _escape(data)
            else:
                rv += data
        elif isinstance(data, list):
            # Value is a list
            for v in data:
                rv += encode_apache(
                    v,
                    convert_bools=convert_bools,
                    convert_nums=convert_nums,
                    indent=indent,
                    level=level+1,
                    quote_all_nums=quote_all_nums,
                    quote_all_strings=quote_all_strings,
                    block_type='value')
                # If not last item of the loop
                if data[-1] != v:
                    rv += " "
    return rv
def encode_erlang(
        data, atom_value_indicator=":", convert_bools=False,
        convert_nums=False, indent="  ", level=0):
    """Convert Python data structure to Erlang format."""
    # Return value
    rv = ""
    if isinstance(data, dict):
        # It's a dict
        rv += "\n"
        for key, val in sorted(data.iteritems()):
            rv += "%s{%s," % (indent*level, key)
            if not isinstance(val, dict):
                rv += " "
            rv += encode_erlang(
                val,
                convert_bools=convert_bools,
                convert_nums=convert_nums,
                indent=indent,
                level=level+1)
            rv += "}"
    elif (
            data == "null" or
            _is_num(data) or
            isinstance(data, bool) or
            (convert_nums and _str_is_num(data)) or
            (convert_bools and _str_is_bool(data))):
        # It's null, number or boolean
        rv += str(data).lower()
    elif isinstance(data, basestring):
        # It's a string
        atom_len = len(atom_value_indicator)
        if (
                len(data) > atom_len and
                data[0:atom_len] == atom_value_indicator):
            # Atom configuration value
            rv += data[atom_len:]
        else:
            rv += '"%s"' % _escape(data)
    else:
        # It's a list
        rv += "["
        for val in data:
            if (
                    isinstance(val, basestring) or
                    _is_num(val)):
                rv += "\n%s" % (indent*level)
            rv += encode_erlang(
                val,
                convert_bools=convert_bools,
                convert_nums=convert_nums,
                indent=indent,
                level=level+1)
            if data[-1] == val:
                # Last item of the loop
                rv += "\n"
            else:
                rv += ","
        if len(data) > 0:
            rv += "%s]" % (indent * (level-1))
        else:
            rv += "]"
        if level == 0:
            rv += ".\n"
    return rv
def encode_haproxy(data, indent="  "):
    """Convert Python data structure to HAProxy format."""
    # Return value
    rv = ""
    # Indicates first loop
    first = True
    # Indicates whether the previous section was a comment
    prev_comment = False
    for section in data:
        if first:
            first = False
        elif prev_comment:
            prev_comment = False
        else:
            # Print empty line between sections
            rv += "\n"
        if isinstance(section, dict):
            # It's a section
            rv += "%s\n" % section.keys()[0]
            # Process all parameters of the section
            for param in section.values()[0]:
                rv += "%s%s\n" % (indent, param)
        else:
            # It's a comment of a parameter
            rv += "%s\n" % section
            prev_comment = True
    return rv
def encode_ini(
        data, comment="#", delimiter="=", quote="", section_is_comment=False,
        ucase_prop=False):
    """Convert Python data structure to INI format."""
    # Return value
    rv = ""
    # First process all standalone properties
    for prop, val in sorted(data.iteritems()):
        if ucase_prop:
            prop = prop.upper()
        vals = []
        if isinstance(val, list):
            vals = val
        elif not isinstance(val, dict):
            vals = [val]
        for item in vals:
            if (
                    len(quote) == 0 and
                    isinstance(item, basestring) and
                    len(item) == 0):
                item = '""'
            if item is not None:
                rv += "%s%s%s%s%s\n" % (
                    prop, delimiter, quote, _escape(item, quote), quote)
    # Then process all sections
    for section, props in sorted(data.iteritems()):
        if isinstance(props, dict):
            if rv != "":
                rv += "\n"
            if section_is_comment:
                rv += "%s %s\n" % (comment, section)
            else:
                rv += "[%s]\n" % (section)
            # Let process all section options as standalone properties
            rv += encode_ini(
                props,
                delimiter=delimiter,
                quote=quote,
                section_is_comment=section_is_comment,
                ucase_prop=ucase_prop)
    return rv
def encode_json(
        data, convert_bools=False, convert_nums=False, indent="  ", level=0):
    """Convert Python data structure to JSON format."""
    # Return value
    rv = ""
    if isinstance(data, dict):
        # It's a dict
        rv += "{"
        if len(data) > 0:
            rv += "\n"
        items = sorted(data.iteritems())
        for key, val in items:
            rv += '%s"%s": ' % (indent * (level+1), key)
            rv += encode_json(
                val,
                convert_bools=convert_bools,
                convert_nums=convert_nums,
                indent=indent,
                level=level+1)
            # Last item of the loop
            if items[-1] == (key, val):
                rv += "\n"
            else:
                rv += ",\n"
        if len(data) > 0:
            rv += "%s}" % (indent * level)
        else:
            rv += "}"
        if level == 0:
            rv += "\n"
    elif (
            data == "null" or
            _is_num(data) or
            (convert_nums and _str_is_num(data)) or
            (convert_bools and _str_is_bool(data))):
        # It's a number, null or boolean
        rv += str(data).lower()
    elif isinstance(data, basestring):
        # It's a string
        rv += '"%s"' % _escape(_escape(data), format='control')
    else:
        # It's a list
        rv += "["
        if len(data) > 0:
            rv += "\n"
        for val in data:
            rv += indent * (level+1)
            rv += encode_json(
                val,
                convert_bools=convert_bools,
                convert_nums=convert_nums,
                indent=indent,
                level=level+1)
            # Last item of the loop
            if data[-1] == val:
                rv += "\n"
            else:
                rv += ",\n"
        if len(data) > 0:
            rv += "%s]" % (indent * level)
        else:
            rv += "]"
    return rv
def encode_logstash(
        data, convert_bools=False, convert_nums=False, indent="  ", level=0,
        prevtype="", section_prefix=":"):
    """Convert Python data structure to Logstash format."""
    # Return value
    rv = ""
    if isinstance(data, dict):
        # The item is a dict
        if prevtype in ('value', 'value_hash', 'array'):
            rv += "{\n"
        items = sorted(data.iteritems())
